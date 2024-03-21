import { JournalLayout } from '../layout/JournalLayout';
import { NoteView, NothingSelectedView } from '../views';

export const JournalPage = () => {
  return (
    <JournalLayout>
      {/* <Typography variant='h1'>JournalPage</Typography>
      <MailOutline /> */}
      {/* <NothingSelectedView /> */}
      <NoteView />
    </JournalLayout>
  )
}
