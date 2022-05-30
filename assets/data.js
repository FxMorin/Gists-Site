const gistFetchOptions = {
  method: 'GET',
  mode: 'cors',
  cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  headers: {
    'Content-Type': 'application/json'
  },
  redirect: 'follow',
  referrerPolicy: 'no-referrer',
};

async function gistFetch(url) {
  try {
    const response = await fetch(url, gistFetchOptions);
    return response.json();
  } catch (err) {
    console.error(`An error occured when trying to fetch gists: ${err}`);
  }
  return null;
}

async function getUserGists(username, amount = 25) {
  return gistFetch(`https://api.github.com/users/${username}/gists?per_page=${amount}`);
}

async function getGist(gistId) {
  return gistFetch(`https://api.github.com/gists/${gistId}`);
}

function getGithubUsername() {
  if (window.location.hostname != null && window.location.hostname != "") return window.location.hostname.split(".")[0];
  return (/:\/\/([^\/]+)/.exec(window.location.href)[1]).split(".")[0];
}

// Gets the original gist that this gist was forked from
async function removeOriginalGists(gistInfos, gist) {
  if (gist != null && gist.fork_of != null && gist.documentation_url == null) {
    const gistParentId = gist.fork_of.id;
    return removeOriginalGists(gistInfos.filter(gistInfo => gistInfo.id != gistParentId), await getGist(gistParentId));
  } else {
    return gistInfos;
  }
}

// Check if any of the gists are forks of another gist in this list. If so, remove the original one
async function removeOutdatedGists(gistInfos) {
  let gistIdList = gistInfos.map(gistInfo => gistInfo.id);
  while (gistIdList.length > 0) {
    const newGistInfos = await removeOriginalGists(gistInfos, await getGist(gistIdList.pop()));
    if (newGistInfos.length != gistInfos.length) {
      gistIdList = newGistInfos.map(gistInfo => gistInfo.id);
      gistInfos = newGistInfos;
    }
  }
  return gistInfos;
}

function modifyElementsOfClassName(className, callback) {
  const elements = document.getElementsByClassName(className);
  for(let i = 0; i < elements.length; i++) {
    callback(elements[i]);
  }
}

const username = getGithubUsername();
console.log(username)

modifyElementsOfClassName("github-gist", gistLink => gistLink.href = "https://gist.github.com/"+username);

gistFetch(`https://api.github.com/users/${username}`).then(userInfo => {
  if (userInfo != null && userInfo.documentation_url == null) {
    modifyElementsOfClassName("title", title => title.innerText = userInfo.name.split(" ")[0]+"'s Public Gists");
    modifyElementsOfClassName("github-avatar", avatar => {
      avatar.src = userInfo.avatar_url;
      avatar.alt = "@"+username;
      if (userInfo.site_admin) {
        avatar.style.border = "2px solid red";
      }
    });
    modifyElementsOfClassName("github-page", pageLink => pageLink.href = userInfo.html_url);
    modifyElementsOfClassName("github-repos", repo => {
      repo.href = `https://github.com/${username}?tab=repositories`;
      repo.innerText = `${userInfo.public_repos} Repos`;
    });
    modifyElementsOfClassName("other-dropdown", other => {
      let inject = "";
      if (userInfo.blog != null) inject += `<li><a class="dropdown-item" href="${userInfo.blog}">Website</a></li>`;
      if (userInfo.twitter_username != null) inject += `<li><a class="dropdown-item" href="https://twitter.com/${userInfo.twitter_username}">Twitter</a></li>`;
      if (userInfo.email != null) inject += `<li><a class="dropdown-item" href="mailto:${userInfo.email}">Email</a></li>`;
      other.innerHTML = inject;
    });
  }
});


getUserGists(username).then(data => {
  console.log(data);
  if (data == null || data.length == 0 || data.documentation_url != null) return;
  removeOutdatedGists(data).then(newData => {
    let newList = "";
    newData.forEach(d => {
      let forks = 0;
      if (d.forks != null && d.forks != undefined) forks = d.forks;
      const hrefLink = `https://gist.github.com/${username}/${d.id}`;
      const icons = `<yeet class="gist-icon"><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16">
    <path fill-rule="evenodd" d="M1.75 1.5a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V1.75a.25.25 0 00-.25-.25H1.75zM0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0114.25 16H1.75A1.75 1.75 0 010 14.25V1.75zm9.22 3.72a.75.75 0 000 1.06L10.69 8 9.22 9.47a.75.75 0 101.06 1.06l2-2a.75.75 0 000-1.06l-2-2a.75.75 0 00-1.06 0zM6.78 6.53a.75.75 0 00-1.06-1.06l-2 2a.75.75 0 000 1.06l2 2a.75.75 0 101.06-1.06L5.31 8l1.47-1.47z"></path>
</svg>
              ${Object.keys(d.files).length} file</yeet>
              <yeet class="gist-icon"><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16">
    <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
</svg>
              ${forks} forks</yeet>
              <yeet class="gist-icon"><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16">
    <path fill-rule="evenodd" d="M2.75 2.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 01.75.75v2.19l2.72-2.72a.75.75 0 01.53-.22h4.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25H2.75zM1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0113.25 12H9.06l-2.573 2.573A1.457 1.457 0 014 13.543V12H2.75A1.75 1.75 0 011 10.25v-7.5z"></path>
</svg>
              ${d.comments} comments</yeet>`;
      if (d.files.length == 0) {
        newList += `<a href="${hrefLink}" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">N/A<span class="badge bg-primary rounded-pill">0</span></a>`;
      } else {
        newList += `<a href="${hrefLink}" class="list-group-item list-group-item-action d-flex justify-content-between">${d.files[Object.keys(d.files)[0]].filename}<span class="gist-icons">${icons}</span></a>`;
      }
    });
    document.getElementById("gistList").innerHTML = newList;
  });
});
