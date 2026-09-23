import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial broadcast database...');

  // 1. Hotkeys
  const defaultHotkeys = [
    // Keyboard Hotkeys
    { actionName: 'SCORE_A_PLUS', keyCode: 'Numpad7', description: 'Skor Tim A +1', category: 'KEYBOARD' },
    { actionName: 'SCORE_A_MINUS', keyCode: 'Shift+Numpad7', description: 'Skor Tim A -1', category: 'KEYBOARD' },
    { actionName: 'SCORE_B_PLUS', keyCode: 'Numpad9', description: 'Skor Tim B +1', category: 'KEYBOARD' },
    { actionName: 'SCORE_B_MINUS', keyCode: 'Shift+Numpad9', description: 'Skor Tim B -1', category: 'KEYBOARD' },
    { actionName: 'TIMER_TOGGLE', keyCode: 'Space', description: 'Start / Pause Timer', category: 'KEYBOARD' },
    { actionName: 'TRIGGER_CELEBRATION', keyCode: 'KeyG', description: 'Animasi Goal / WWCD Pop-up', category: 'KEYBOARD' },
    { actionName: 'TOGGLE_LOWER_THIRD', keyCode: 'KeyL', description: 'Toggle Lower Third Caster', category: 'KEYBOARD' },
    { actionName: 'TOGGLE_SPONSOR', keyCode: 'KeyS', description: 'Toggle Sponsor Carousel', category: 'KEYBOARD' },

    // Controller Hotkeys (Default layout similar to Xbox/PS)
    { actionName: 'CTRL_SCORE_A_PLUS', keyCode: 'Gamepad_Button4', description: 'Skor Tim A +1 (Controller L1/LB)', category: 'CONTROLLER' },
    { actionName: 'CTRL_SCORE_A_MINUS', keyCode: 'Gamepad_Button6', description: 'Skor Tim A -1 (Controller L2/LT)', category: 'CONTROLLER' },
    { actionName: 'CTRL_SCORE_B_PLUS', keyCode: 'Gamepad_Button5', description: 'Skor Tim B +1 (Controller R1/RB)', category: 'CONTROLLER' },
    { actionName: 'CTRL_SCORE_B_MINUS', keyCode: 'Gamepad_Button7', description: 'Skor Tim B -1 (Controller R2/RT)', category: 'CONTROLLER' },
    { actionName: 'CTRL_TIMER_TOGGLE', keyCode: 'Gamepad_Button9', description: 'Start / Pause Timer (Controller Start/Options)', category: 'CONTROLLER' },
    { actionName: 'CTRL_TRIGGER_CELEBRATION', keyCode: 'Gamepad_Button0', description: 'Animasi Goal / WWCD Pop-up (Controller A/Cross)', category: 'CONTROLLER' },
    { actionName: 'CTRL_TOGGLE_LOWER_THIRD', keyCode: 'Gamepad_Button12', description: 'Toggle Lower Third (Controller D-Pad Up)', category: 'CONTROLLER' },
    { actionName: 'CTRL_TOGGLE_SPONSOR', keyCode: 'Gamepad_Button13', description: 'Toggle Sponsor Carousel (Controller D-Pad Down)', category: 'CONTROLLER' },
  ];

  for (const hk of defaultHotkeys) {
    await prisma.hotkeyConfig.upsert({
      where: { actionName: hk.actionName },
      update: hk,
      create: hk,
    });
  }

  // 2. Template
  const template = await prisma.overlayTemplate.upsert({
    where: { id: 'default-template' },
    update: {},
    create: {
      id: 'default-template',
      name: 'Cyber Modern Broadcast',
      primaryColor: '#0f172a',
      secondaryColor: '#ffffff',
      accentColor: '#3b82f6',
      fontFamily: 'Montserrat',
    },
  });

  // 3. Teams
  const teamRex = await prisma.team.upsert({
    where: { id: 'team-rex' },
    update: {},
    create: {
      id: 'team-rex',
      name: 'RRQ HOSHI',
      institution: 'Jakarta, Indonesia',
      brandColor: '#f59e0b',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=RRQ',
    },
  });

  const teamOnic = await prisma.team.upsert({
    where: { id: 'team-onic' },
    update: {},
    create: {
      id: 'team-onic',
      name: 'ONIC ESPORTS',
      institution: 'Kuningan, Indonesia',
      brandColor: '#eab308',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=ONIC',
    },
  });

  const teamPersija = await prisma.team.upsert({
    where: { id: 'team-persija' },
    update: {},
    create: {
      id: 'team-persija',
      name: 'PERSIJA FC',
      institution: 'DKI Jakarta',
      brandColor: '#ef4444',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=PERSIJA',
    },
  });

  const teamPersib = await prisma.team.upsert({
    where: { id: 'team-persib' },
    update: {},
    create: {
      id: 'team-persib',
      name: 'PERSIB BANDUNG',
      institution: 'Jawa Barat',
      brandColor: '#2563eb',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=PERSIB',
    },
  });

  // 4. Sample Heroes for MOBA
  const heroesData = [
    { name: 'Fanny', role: 'Assassin', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fanny' },
    { name: 'Ling', role: 'Assassin', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ling' },
    { name: 'Lancelot', role: 'Assassin', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lancelot' },
    { name: 'Tigreal', role: 'Tank', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Tigreal' },
    { name: 'Franco', role: 'Tank', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Franco' },
    { name: 'Kagura', role: 'Mage', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kagura' },
    { name: 'Pharsa', role: 'Mage', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Pharsa' },
    { name: 'Beatrix', role: 'Marksman', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Beatrix' },
    { name: 'Claude', role: 'Marksman', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Claude' },
    { name: 'Chou', role: 'Fighter', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Chou' },
    { name: 'Paquito', role: 'Fighter', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Paquito' },
    { name: 'Mathilda', role: 'Support', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mathilda' },
  ];

  for (const h of heroesData) {
    const existing = await prisma.hero.findFirst({ where: { name: h.name } });
    if (!existing) {
      await prisma.hero.create({ data: h });
    }
  }

  // 5. Events & Matches
  const sportEvent = await prisma.event.upsert({
    where: { id: 'sport-league-2026' },
    update: {},
    create: {
      id: 'sport-league-2026',
      name: 'NATIONAL PREMIER LEAGUE 2026',
      eventType: 'SPORT',
      location: 'Gelora Stadium',
      templateId: template.id,
    },
  });

  const mobaEvent = await prisma.event.upsert({
    where: { id: 'moba-championship-2026' },
    update: {},
    create: {
      id: 'moba-championship-2026',
      name: 'MPL INDONESIA GRAND FINALS',
      eventType: 'ESPORT_MOBA',
      location: 'Istora Senayan',
      templateId: template.id,
    },
  });

  // Sports Match
  await prisma.match.upsert({
    where: { id: 'match-sport-01' },
    update: {},
    create: {
      id: 'match-sport-01',
      eventId: sportEvent.id,
      teamAId: teamPersija.id,
      teamBId: teamPersib.id,
      scoreA: 1,
      scoreB: 0,
      boSeries: 1,
      status: 'LIVE',
      timerSeconds: 1530, // 25:30
      isTimerRunning: true,
      currentPeriod: 'Half 1',
    },
  });

  // MOBA Match
  await prisma.match.upsert({
    where: { id: 'match-moba-01' },
    update: {},
    create: {
      id: 'match-moba-01',
      eventId: mobaEvent.id,
      teamAId: teamRex.id,
      teamBId: teamOnic.id,
      scoreA: 2,
      scoreB: 1,
      boSeries: 5,
      status: 'LIVE',
      timerSeconds: 780, // 13:00
      isTimerRunning: true,
      currentPeriod: 'Game 4',
    },
  });

  // 6. Sponsors
  await prisma.sponsor.upsert({
    where: { id: 'sp-1' },
    update: {},
    create: {
      id: 'sp-1',
      eventId: sportEvent.id,
      name: 'Tech Brand X',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=TechBrand',
      displayOrder: 1,
    },
  });

  await prisma.sponsor.upsert({
    where: { id: 'sp-2' },
    update: {},
    create: {
      id: 'sp-2',
      eventId: sportEvent.id,
      name: 'Energy Drink Ultra',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=EnergyUltra',
      displayOrder: 2,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
