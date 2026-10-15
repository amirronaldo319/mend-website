/* ============================================================
   MEND — site settings. This is the ONLY file you need to edit
   to connect the waitlist and publish a contact address.

   formEndpoint  Where waitlist signups are POSTed (JSON-accepting
                 form service, e.g. Formspree: "https://formspree.io/f/abcdwxyz").
                 While this is empty the form tells visitors the waitlist
                 isn't open yet and never pretends to save an email.

   contactEmail  A real, monitored address, e.g. "hello@yourdomain.com".
                 While this is empty, every page says a contact address
                 will be added before launch instead of showing a fake one.
   ============================================================ */
window.MEND_CONFIG = {
  formEndpoint: "",
  contactEmail: ""
};
