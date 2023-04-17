import { Container, Box } from '@mantine/core'
import Header from './Header'
import ListItem from './ListItem'
import MainArea from './MainArea'
import { useLayoutContext } from '../hooks/useLayoutContext'
import { getNotesFromFirebase, setNotesToFirebase } from '../store/action/firebaseExchange'
import { Note, NoteProps } from '../interfaces/NoteProps'
import { useEffect, useState } from 'react'
import { addNotes } from '../store/action/AddToLocalDB'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../store/action/NotesDB'

const Layout = () => {
  const { visible } = useLayoutContext()
  const [notes, setNotes] = useState<Note[]>([])
  //создаём список для отображения
  const [myNotesList, setMyNotesList] = useState<NoteProps[]>([])
  const { setCurrentNote } = useLayoutContext()
  useEffect(() => {
    db.notes.clear()
    //получаем записи из Firebase
    getNotesFromFirebase('denis.lkg@gmail.com').then((notes) => setNotes(notes))
  }, [])
  //получаем записи из IndexedDB
  const notesListFromIDB = useLiveQuery(() => db.notes.toArray())

  useEffect(() => {
    //записываем полученные данные в IndexedDB
    const tempArray: NoteProps[] = []
    notes.map((note, index) => {
      tempArray.push({
        id: note.id,
        title: note.title,
        body: note.body,
        additionalText: note.body.substring(0, 10),
        created_at: new Date(),
        active: index === 0 ? true : false, //показываем первую запись активной
      })
      addNotes(note)
    })
    setMyNotesList(tempArray)
    setCurrentNote(tempArray[0]) //делаем первую запись активной, чтобы отобразилась в редакторе
  }, [notes])

  return (
    <Container size="xl">
      <div className="main">
        <button
          onClick={() => {
            setNotesToFirebase({ user: 'denis.lkg@gmail.com', notes: notesListFromIDB })
          }}>
          toFB
        </button>
        <button
          onClick={() => {
            getNotesFromFirebase('denis.lkg@gmail.com')
          }}>
          fromFB
        </button>

        <Header />
        <Box
          className="containerShadow"
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyItems: 'flex-start',
          }}>
          <ListItem visible={visible} notesList={myNotesList} />
          <MainArea visible={visible} />
        </Box>
      </div>
    </Container>
  )
}

export default Layout
