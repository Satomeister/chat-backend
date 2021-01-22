module.exports = getAvatarColor = (id) => {
  id = id.toString();
  let res = "#";
  for (let i = 0; i < 6; i++) {
    res += id.charAt(Math.floor(Math.random() * 24));
  }
  return res;
};
