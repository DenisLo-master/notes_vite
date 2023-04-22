import { db } from './indexDB'
import {
  Note,
  NoteFB,
  NoteTitle,
  UpdateNote,
} from '../../interfaces/NoteProps'
import { deleteAllImagesDB, deleteNoteImagesDB } from './imageDB'
import { deleteNoteFromFirebase, setNoteToFirebase } from './fbDataBaseExchange'

interface DeleteNoteProps {
  uid: string
  noteId: number
}

interface CreateNote {
  uid: string
  note: Note
}

interface UpdateNoteTitle {
  uid: string
  noteTitle: NoteTitle
}

export async function updateNoteDB(note: UpdateNote): Promise<void> {
  try {
    await db.updateNote(note)
  } catch (error) {
    console.log(error)
  }
}
export async function updateNoteTitleDB({ uid, noteTitle }: UpdateNoteTitle): Promise<void> {
  try {
    await db.updateNoteTitle(noteTitle)
    setNoteToFirebase({
      uid,
      noteId: noteTitle.id,
    })
  } catch (error) {
    console.log(error)
  }
}


export async function deleteNoteDB({ uid, noteId }: DeleteNoteProps): Promise<void> {
  try {
    db.deleteNote(noteId)
    deleteNoteImagesDB(noteId)
    deleteNoteFromFirebase({
      uid,
      noteId
    })
  } catch (error) {
    console.log('ERROR clear notes', error)
  }
}

export async function clearNotesDB(): Promise<void> {
  try {
    deleteAllImagesDB()
    await db.clearNotes()
  } catch (error) {
    console.log('ERROR clear notes', error)
  }
}

export async function createNoteDB({ uid, note }: CreateNote): Promise<void> {
  try {
    await db.createNote(note)
    const noteFB: NoteFB = { ...note }
    setNoteToFirebase({
      uid,
      noteId: noteFB.id,
    })
  } catch (error) {
    console.log(error)
  }
}

export async function getNoteDB(noteId: number): Promise<Note | undefined> {
  try {
    return await db.getNote(noteId)
  } catch (error) {
    console.log(error)
  }
}

export async function getNotesListDB(): Promise<Note[] | undefined> {
  try {
    return await db.getNotesList()
  } catch (error) {
    console.log(error)
  }
}
