  /**
   *
   * @param str
   * @returns {string}
   */
  export const minifyString = (str: string) => {
  let _str = str;

  try {
    _str = (str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase());
  } catch (e) {

  }

  return _str;
}