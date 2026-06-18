const LocalData = {
  setData: (name = "localData", data) => {
    try {
      localStorage.setItem(name, JSON.stringify(data));
    } catch (err) {
      return null;
    }
  },

  removeData: (name = "localData") => {
    try {
      if (localStorage?.getItem(name)) {
        localStorage.removeItem(name);
      }
    } catch (err) {
      return null;
    }
  },

  getData: (name = "localData") => {
    try {
      return JSON.parse(localStorage?.getItem(name) || "null");
    } catch (err) {
      return null;
    }
  },
};

export default LocalData;
