function gistsApiUrl(username, limit = 100) {
  try {
    return requestJson(`https://api.github.com/users/${username}/gists?per_page=${limit}`);
  } catch (err) {
    console.error(`An error occured when trying to fetch gists: ${err}`);
  }
  return null;
}

function getUsername() {
  return /:\/\/([^\/]+)/.exec(window.location.href)[1];
}

console.log(window.location.hostname);
console.log(window.location.href);
console.log(getUsername());
console.log(gistsApiUrl(getUsername()));
