import { Container, Box, Button } from '@mantine/core'
import Header from './Header'
import ListItem from './ListItem'
import MainArea from './MainArea'
import { useLayoutContext } from '../hooks/useLayoutContext'
import {
  getNotesFromFirebase,
  setNotesToFirebase,
} from '../store/action/firebaseExchange'
import { Note, NoteProps } from '../interfaces/NoteProps'
import { useEffect, useState, FC, useContext } from 'react'
import { addNotes } from '../store/action/AddToLocalDB'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../store/action/NotesDB'
import moment from 'moment'
import { useAuth } from '../context/AuthProvider'

const Layout = () => {
  const { signOutUser, currentUserId } = useAuth()

  const { visible } = useLayoutContext()
  const [notes, setNotes] = useState<Note[]>([])

  //создаём список для отображения
  const [myNotesList, setMyNotesList] = useState<NoteProps[]>([])
  const { setCurrentNote } = useLayoutContext()

  const [serchedText, setSearchedText] = useState('')

  const searchedNotesList = serchedText
    ? myNotesList.filter(
        (note) => note.title.toLowerCase().includes(serchedText) || note.body.toLowerCase().includes(serchedText),
      )
    : myNotesList

  useEffect(() => {
    db.notes.clear()
    //получаем записи из Firebase
    getNotesFromFirebase(currentUserId /* 'denis.lkg@gmail.com' */).then(
      (notes) => {
        setNotes(notes)
      },
    )
  }, [])

  //получаем записи из IndexedDB
  const notesListFromIDB = useLiveQuery(() => db.notes.toArray()) as Note[]

  useEffect(() => {
    const tempArray: NoteProps[] = []
    notesListFromIDB &&
      notesListFromIDB.map((note, index) => {
        tempArray.push({
          id: note.id,
          title: note.title,
          body: note.body,
          additionalText: note.body.substring(0, 10),
          created_at: moment(note.created_at).format('L'),
          active: index === 0 ? true : false, //показываем первую запись активной
        })
      })

    setMyNotesList(tempArray)
  }, [notesListFromIDB])

  useEffect(() => {
    const tempArray: NoteProps[] = []
    notes &&
      notes.map((note, index) => {
        tempArray.push({
          id: note.id,
          title: note.title,
          body: note.body,
          additionalText: note.body.substring(0, 10),
          created_at: moment(note.created_at).format('L'),
          active: index === 0 ? true : false, //показываем первую запись активной
        })
        addNotes(note)
      })

    setMyNotesList(tempArray)
    setCurrentNote(tempArray[0]) //делаем первую запись активной, чтобы отобразилась в редакторе
  }, [notes])

  //отправляем в FireBase, если не пустой список
  if (notesListFromIDB && notesListFromIDB.length !== 0) {
    setNotesToFirebase({
      user: currentUserId,
      /* user: 'denis.lkg@gmail.com', */
      notes: notesListFromIDB,
    })
  }
  // выход из аккаунта
  const handleClickOut = () => {
    signOutUser()
  }

  return (
    <Container size="xl">
      <div className="main">
        <button
          onClick={() => {
            setNotesToFirebase({
              user: 'denis.lkg@gmail.com',
              notes: notesListFromIDB,
            })
          }}
        >
          toFB
        </button>
        <button
          onClick={() => {
            getNotesFromFirebase('denis.lkg@gmail.com')
          }}
        >
          fromFB
        </button>
        {/* Кнопка выхода из аккаунта */}
        <Button pos={'fixed'} right={0} m={10} onClick={handleClickOut}>
          Выход
        </Button>

        <Header addItem={setMyNotesList} serchText={setSearchedText} />
        <Box
          className="containerShadow"
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyItems: 'flex-start',
          }}
        >
          <ListItem visible={visible} notesList={searchedNotesList} />
          <MainArea visible={visible} />
        </Box>
      </div>
    </Container>
  )
}

export default Layout
