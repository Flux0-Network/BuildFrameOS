import { getContacts } from "../actions/contacts";
import { ContactList } from "@/components/contacts/contact-list";

export default async function KontaktePage() {
  const contacts = await getContacts();
  return <ContactList contacts={contacts} />;
}
