document.addEventListener('DOMContentLoaded', () => {
    const linkTitle = document.getElementById('linkTitle');
    const linkUrl = document.getElementById('linkUrl');
    const linkTags = document.getElementById('linkTags');
    const saveButton = document.getElementById('saveButton');
    const linksContainer = document.getElementById('links');
    const searchInput = document.getElementById('search');

    let editIndex = -1;
    let links = [];

    const debounce = (func, delay) => {
        let debounceTimer;
        return function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, arguments), delay);
        };
    };

    const fetchLinks = () => {
        chrome.storage.sync.get({ links: [] }, result => {
            links = result.links;
            displayLinks();
        });
    };

    const displayLinks = () => {
        const searchText = searchInput.value.toLowerCase();
        const filteredLinks = links.filter(link => {
            return link.title.toLowerCase().includes(searchText) ||
                link.url.toLowerCase().includes(searchText) ||
                link.tags.some(tag => tag.toLowerCase().includes(searchText));
        });

        linksContainer.innerHTML = '';
        filteredLinks.forEach((link, index) => {
            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            linkItem.innerHTML = `
          <h2>${link.title}</h2>
          <p><a href="${link.url}" target="_blank">${link.url}</a></p>
          <p>Tags: ${link.tags.join(', ')}</p>
          <button class="edit-button">Edit</button>
          <button class="delete-button">Delete</button>
        `;

            linkItem.querySelector('.edit-button').addEventListener('click', () => {
                linkTitle.value = link.title;
                linkUrl.value = link.url;
                linkTags.value = link.tags.join(', ');
                editIndex = index;
            });

            linkItem.querySelector('.delete-button').addEventListener('click', () => {
                links.splice(index, 1);
                chrome.storage.sync.set({ links }, displayLinks);
            });

            linksContainer.appendChild(linkItem);
        });
    };

    saveButton.addEventListener('click', () => {
        const title = linkTitle.value;
        const url = linkUrl.value;
        const tags = linkTags.value.split(',').map(tag => tag.trim());

        if (title && url) {
            if (editIndex >= 0) {
                links[editIndex] = { title, url, tags };
                editIndex = -1;
            } else {
                links.unshift({ title, url, tags });
            }
            chrome.storage.sync.set({ links }, () => {
                displayLinks();
                linkTitle.value = '';
                linkUrl.value = '';
                linkTags.value = '';
            });
        }
    });

    searchInput.addEventListener('input', debounce(displayLinks, 300));

    fetchLinks();
});