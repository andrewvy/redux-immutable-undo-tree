export default function() {
  if (!Date.now) {
    return new Date().getTime();
  } else {
    return Date.now();
  }
}
