const Language = {
  setLanguage: (data) => {
    try {
      localStorage.setItem("language", JSON.stringify(data));
    } catch (err) {
      return null;
    }
  },

  removeLanguage: () => {
    try {
      if (localStorage?.getItem("language")) {
        localStorage.removeItem("language");
      }
    } catch (err) {
      return null;
    }
  },

  getLanguage: () => {
    try {
      return JSON.parse(localStorage?.getItem("language") || "null");
    } catch (err) {
      return null;
    }
  },
};

export default Language;
