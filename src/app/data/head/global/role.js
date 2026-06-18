export default Object.assign({
  editor: {
    label: {
      en: "Editor",
    },
    access: {
      question: {
        read: true,
        add: true,
        edit: true,
      },
      questionImage: {
        read: true,
        add: false,
        edit: false,
      },
    },
  },
  illustrator: {
    label: {
      en: "Illustrator",
    },
    access: {
      question: {
        read: true,
        add: false,
        edit: false,
      },
      questionImage: {
        read: true,
        add: true,
        edit: true,
      },
    },
  },
});
