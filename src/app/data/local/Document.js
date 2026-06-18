const Document = {
  setDocument: (data) => {
    try {
      sessionStorage.setItem("dataDocument", JSON.stringify(data));
    } catch (err) {
      return null;
    }
  },

  removeDocument: () => {
    try {
      if (sessionStorage?.getItem("dataDocument")) {
        sessionStorage.removeItem("dataDocument");
      }
    } catch (err) {
      return null;
    }
  },

  getDocument: () => {
    try {
      return JSON.parse(sessionStorage?.getItem("dataDocument") || "null");
    } catch (err) {
      return null;
    }
  },
};

export default Document;
