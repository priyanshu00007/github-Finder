async function fetchProfile() {
    const username = document.getElementById('username').value;
    const profileContainer = document.getElementById('profile-container');
    const loader = document.getElementById('loader');
    
    profileContainer.innerHTML = ''; // Clear any existing content
    loader.classList.remove('hidden'); // Show the loader

    if (username === '') {
        alert('Please enter a GitHub username');
        loader.classList.add('hidden'); // Hide the loader
        return;
    }

    try {
        const [userResponse, reposResponse] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`),
            fetch(`https://api.github.com/users/${username}/repos`)
        ]);

        if (!userResponse.ok || !reposResponse.ok) {
            throw new Error('User not found');
        }

        const user = await userResponse.json();
        const repos = await reposResponse.json();
        loader.classList.add('hidden'); // Hide the loader

        // Create profile element
        const profileDiv = document.createElement('div');
        profileDiv.classList.add('profile');

        const profileImage = document.createElement('img');
        profileImage.src = user.avatar_url;

        const profileInfo = document.createElement('div');
        profileInfo.classList.add('profile-info');

        const profileName = document.createElement('h3');
        profileName.textContent = `@${user.login}`;

        const profileStats = document.createElement('p');
        profileStats.textContent = `Repositories: ${user.public_repos} Followers: ${user.followers} Following: ${user.following}`;

        const profileButton = document.createElement('button');
        profileButton.textContent = 'View Profile';
        profileButton.onclick = () => window.open(user.html_url, '_blank');

        // Additional details section
        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('details');
        
        const detailsButton = document.createElement('button');
        detailsButton.textContent = 'Show More Details';
        detailsButton.onclick = () => {
            detailsDiv.classList.toggle('expanded');
            detailsButton.textContent = detailsDiv.classList.contains('expanded') ? 'Show Less Details' : 'Show More Details';
        };

        const detailsContent = document.createElement('div');
        detailsContent.classList.add('details-content');
        
        const detailSections = [
            { label: 'Location', value: user.location },
            { label: 'Company', value: user.company },
            { label: 'Public Gists', value: user.public_gists },
            { label: 'Bio', value: user.bio },
            { label: 'Total Repositories', value: user.public_repos }
        ];
        
        detailsContent.innerHTML = detailSections
            .filter(section => section.value) // Only include non-empty values
            .map(section => `
                <div class="detail-section">
                    <h4>${section.label}:</h4>
                    <p>${section.value}</p>
                </div>
            `).join('') + `
            <div class="detail-section">
                <h4>Languages Used in Repositories:</h4>
                ${getLanguagesUsed(repos)}
            </div>
            <div class="social-links">
                <h4>Connect with ${user.login}:</h4>
                <a href="${user.html_url}?tab=repositories" target="_blank">Repositories</a>
                ${user.blog ? `<a href="${user.blog}" target="_blank">Blog</a>` : ''}
                ${user.twitter_username ? `<a href="https://twitter.com/${user.twitter_username}" target="_blank">Twitter</a>` : ''}
                ${user.linkedin ? `<a href="${user.linkedin}" target="_blank">LinkedIn</a>` : ''}
            </div>
        `;

        detailsDiv.appendChild(detailsButton);
        detailsDiv.appendChild(detailsContent);

        profileInfo.appendChild(profileName);
        profileInfo.appendChild(profileStats);
        profileDiv.appendChild(profileImage);
        profileDiv.appendChild(profileInfo);
        profileDiv.appendChild(profileButton);
        profileDiv.appendChild(detailsDiv);

        profileContainer.appendChild(profileDiv);

    } catch (error) {
        loader.classList.add('hidden'); // Hide the loader
        profileContainer.innerHTML = `<p>${error.message}</p>`;
    }
}

function getLanguagesUsed(repos) {
    const languages = {};
    repos.forEach(repo => {
        if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
    });

    return Object.keys(languages).map(lang => `<p>${lang}: ${languages[lang]} repos</p>`).join('');
}
