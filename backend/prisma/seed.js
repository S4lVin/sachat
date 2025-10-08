import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

/**
 * Genera un numero casuale tra min e max (inclusi)
 */
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Seleziona un elemento casuale da un array
 */
const randomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Dati di esempio per generare contenuti realistici
 */
const CHAT_TITLES = [
  'Progetto React',
  'Bug da fixare',
  'Idee per il weekend',
  'Ricetta pasta al forno',
  'Consigli di viaggio',
  'Setup sviluppo',
  'Domande su JavaScript',
  'Piano di allenamento',
  'Lista della spesa',
  'Appunti riunione',
  'Tutorial Node.js',
  'Debugging session',
  'Brainstorming app',
  'Note casuali',
  'Promemoria importante',
]

const USER_MESSAGES = [
  'Ciao! Come stai?',
  'Ho bisogno di aiuto con questo codice',
  'Puoi spiegarmi come funziona?',
  "Grazie mille per l'aiuto!",
  'Non ho capito questa parte',
  'Perfetto, ora è tutto chiaro',
  'Ho un errore strano nel terminale',
  'Secondo te quale approccio è migliore?',
  'Sto cercando di implementare questa feature',
  'Mi dai un esempio pratico?',
  'Interessante, non ci avevo pensato',
  'Ok, provo subito!',
  'Funziona alla grande!',
  'Ci sono alternative?',
  'Dove posso trovare più info su questo?',
]

const AI_MESSAGES = [
  'Certo! Sono qui per aiutarti.',
  'Fammi vedere il codice e ti aiuto a risolverlo.',
  'Ecco una spiegazione dettagliata...',
  'Prego! Sono felice di essere utile.',
  'Provo a riformulare in modo più semplice.',
  'Ottimo! Hai capito perfettamente.',
  'Vediamo insieme qual è il problema.',
  'Entrambi gli approcci hanno pro e contro. Ti spiego...',
  'Ecco un esempio che dovrebbe chiarire il concetto:',
  'Certo! Ecco un caso pratico...',
  'Sono contento che ti sia utile!',
  'Fammi sapere come va!',
  'Fantastico! Continua così.',
  'Sì, ci sono diverse alternative. Ecco le principali:',
  'Ti consiglio la documentazione ufficiale, oppure...',
]

/**
 * Genera messaggi casuali per una chat
 */
const generateMessages = (count) => {
  const messages = []

  for (let i = 0; i < count; i++) {
    const isUser = i % 2 === 0 // Alterna user e AI

    messages.push({
      sender: isUser ? 'user' : 'ai',
      content: isUser ? randomElement(USER_MESSAGES) : randomElement(AI_MESSAGES),
    })
  }

  return messages
}

/**
 * Seed principale del database
 */
const seed = async () => {
  console.log('🌱 Inizio seed del database...\n')

  // Pulisci il database (opzionale)
  console.log('🧹 Pulizia database...')
  await prisma.message.deleteMany()
  await prisma.chat.deleteMany()
  await prisma.user.deleteMany()
  console.log('✅ Database pulito\n')

  // Password hashata per tutti gli utenti (password: "password123")
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Crea utenti
  const userNames = [
    { name: 'Mario Rossi', email: 'mario@example.com' },
    { name: 'Laura Bianchi', email: 'laura@example.com' },
    { name: 'Giuseppe Verdi', email: 'giuseppe@example.com' },
    { name: 'Anna Neri', email: 'anna@example.com' },
    { name: 'Francesco Ferrari', email: 'francesco@example.com' },
  ]

  console.log('👥 Creazione utenti...')

  for (const userData of userNames) {
    const numChats = randomInt(2, 5) // Ogni utente avrà 2-5 chat

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        chats: {
          create: Array.from({ length: numChats }, () => {
            const numMessages = randomInt(3, 10) // Ogni chat avrà 3-10 messaggi

            return {
              title: randomElement(CHAT_TITLES),
              messages: {
                create: generateMessages(numMessages),
              },
            }
          }),
        },
      },
      include: {
        chats: {
          include: {
            messages: true,
          },
        },
      },
    })

    console.log(`✅ ${user.name} creato con ${user.chats.length} chat`)
  }

  // Statistiche finali
  const totalUsers = await prisma.user.count()
  const totalChats = await prisma.chat.count()
  const totalMessages = await prisma.message.count()

  console.log('\n📊 Statistiche finali:')
  console.log(`   👥 Utenti: ${totalUsers}`)
  console.log(`   💬 Chat: ${totalChats}`)
  console.log(`   📝 Messaggi: ${totalMessages}`)
  console.log('\n🎉 Seed completato con successo!')
  console.log('\n🔑 Credenziali per tutti gli utenti:')
  console.log('   Password: password123')
}

// Esegui il seed
seed()
  .catch((error) => {
    console.error('\n❌ Errore durante il seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
