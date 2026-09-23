import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // Helper function to generate standard tournament seeding
  const getStandardSeeding = (bracketSize: number): number[] => {
    let seeds = [1, 2];
    for (let round = 2; round < Math.log2(bracketSize) + 1; round++) {
      const currentMatches = Math.pow(2, round);
      const newSeeds = [];
      for (let i = 0; i < seeds.length; i++) {
        newSeeds.push(seeds[i]);
        newSeeds.push(currentMatches + 1 - seeds[i]);
      }
      seeds = newSeeds;
    }
    return seeds;
  };

  try {
    const { eventId, teamIds = [] } = req.body;
    if (!eventId) return res.status(400).json({ success: false, error: 'Event ID is required' });

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });

    const bracketSize = event.bracketSize || 0;
    if (bracketSize < 4) return res.status(400).json({ success: false, error: 'Bracket size must be at least 4' });

    // Delete existing matches for this event to start fresh
    await prisma.match.deleteMany({ where: { eventId } });

    // Generate matches based on size
    const rounds = Math.log2(bracketSize);
    let matchCounter = 1;
    const generatedMatches: any[] = [];
    
    // Create matches from final up to the first round
    // We'll store them in a tree structure first, then flatten and save
    const nodes: any[] = [];
    const autoAdvanceNodes: any[] = []; // Track matches that finish instantly due to BYE

    // Create Grand Final
    const grandFinal = {
      id: crypto.randomUUID(),
      eventId,
      round: 'Grand Final',
      matchCode: 'GF',
      matchNumber: 999,
      placeholderA: 'Winner SF1',
      placeholderB: 'Winner SF2',
      status: 'UPCOMING',
    };
    nodes.push(grandFinal);

    let thirdPlace: any = null;
    if (event.hasThirdPlace) {
      thirdPlace = {
        id: crypto.randomUUID(),
        eventId,
        round: '3rd Place',
        matchCode: '3RD',
        matchNumber: 998,
        placeholderA: 'Loser SF1',
        placeholderB: 'Loser SF2',
        status: 'UPCOMING',
      };
      nodes.push(thirdPlace);
    }

    let previousRoundNodes = [grandFinal];
    let currentRoundNodes: any[] = [];
    
    // We build backwards
    for (let r = 1; r < rounds; r++) {
      const isSF = r === 1;
      const roundName = isSF ? 'Semi Final' : (r === 2 ? 'Quarter Final' : (r === 3 ? '16 Besar' : '32 Besar'));
      const numMatches = Math.pow(2, r);
      
      currentRoundNodes = [];
      
      for (let i = 0; i < numMatches; i++) {
        const nextNodeIndex = Math.floor(i / 2);
        const nextNode = previousRoundNodes[nextNodeIndex];
        const isTeamA = i % 2 === 0; // True if it feeds into slot A of next match
        
        const matchCode = isSF ? `SF${i + 1}` : (roundName === 'Quarter Final' ? `QF${i + 1}` : `R${Math.pow(2, r+1)}_${i + 1}`);
        const placeholderA = `TBD (${matchCode} Team A)`;
        const placeholderB = `TBD (${matchCode} Team B)`;
        
        const node: any = {
          id: crypto.randomUUID(),
          eventId,
          round: roundName,
          matchCode,
          matchNumber: rounds * 100 - (r * 100) + i,
          placeholderA,
          placeholderB,
          winnerNextId: nextNode.id,
          loserNextId: isSF && thirdPlace ? thirdPlace.id : null,
          status: 'UPCOMING',
          scoreA: 0,
          scoreB: 0,
        };

        // If this is the first round (r === rounds - 1), assign teams based on seed
        if (r === rounds - 1) {
          const seeds = getStandardSeeding(bracketSize);
          const seedA = seeds[i * 2];
          const seedB = seeds[i * 2 + 1];

          const teamAId = teamIds[seedA - 1] || null;
          const teamBId = teamIds[seedB - 1] || null;

          if (teamAId) node.teamAId = teamAId;
          else node.placeholderA = `BYE`;

          if (teamBId) node.teamBId = teamBId;
          else node.placeholderB = `BYE`;

          // BYE Handling (Auto-Advance)
          if ((teamAId && !teamBId) || (!teamAId && teamBId)) {
            node.status = 'FINISHED';
            node.scoreA = teamAId ? 1 : 0;
            node.scoreB = teamBId ? 1 : 0;
            autoAdvanceNodes.push(node);
          } else if (!teamAId && !teamBId) {
            // Both are BYE (should only happen if there are very few teams)
            // Just leave it upcoming and let operator resolve it, or auto-advance a dummy
          }
        }
        
        if (isTeamA) {
          nextNode.placeholderA = `Winner ${matchCode}`;
        } else {
          nextNode.placeholderB = `Winner ${matchCode}`;
        }

        if (isSF && thirdPlace) {
          if (isTeamA) thirdPlace.placeholderA = `Loser ${matchCode}`;
          else thirdPlace.placeholderB = `Loser ${matchCode}`;
        }
        
        currentRoundNodes.push(node);
        nodes.push(node);
      }
      
      previousRoundNodes = currentRoundNodes;
    }
    
    // Propagate auto-advanced winners to the next node in memory BEFORE saving
    for (const advNode of autoAdvanceNodes) {
      if (advNode.winnerNextId) {
        const nextMatch = nodes.find(n => n.id === advNode.winnerNextId);
        if (nextMatch) {
          const winnerTeamId = advNode.scoreA > advNode.scoreB ? advNode.teamAId : advNode.teamBId;
          if (winnerTeamId) {
            if (!nextMatch.teamAId) {
              nextMatch.teamAId = winnerTeamId;
            } else if (!nextMatch.teamBId) {
              nextMatch.teamBId = winnerTeamId;
            }
          }
        }
      }
    }

    // Save to database in a single batch to avoid locking
    await prisma.match.createMany({ data: nodes });

    return res.status(200).json({ success: true, message: `Bracket with ${nodes.length} matches generated.` });
  } catch (error: any) {
    console.error('API /events/bracket error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
