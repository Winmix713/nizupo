        // Constants
        const TIMER_DURATION = 375;
        const API_BASE_URL = 'https://winmix.hu/api/2/fullapi.php';
        const PREDICTION_WEIGHTS = {
            h2h: 0.4,
            form: 0.3,
            goals: 0.2,
            btts: 0.1
        };
        const DOM_ELEMENT_IDS = {
            timer: 'timer',
            matchGrid: 'matchGrid',
            runPredictionsButton: 'runPredictions',
            predictionResults: 'predictionResults',
            predictionGrid: 'predictionGrid',
            mainContent: 'mainContent',
            homeLink: 'homeLink',
             favoritedStatisticsLink: 'favoritedStatisticsLink',
            statisticsLink: 'statisticsLink',
            recentLink: 'recentLink',
            settingsLink: 'settingsLink',
            matchSelection: 'matchSelection',
            footerFavorite: 'footerFavorite',
            searchMatches: 'searchMatches',
            leagueFilter: 'leagueFilter',
            loginBtn: 'loginBtn',
            username: 'username',
            userProfile: 'userProfile',
            loggedInUsername: 'loggedInUsername',
            logoutBtn: 'logoutBtn',
             loginModal: 'loginModal',
             loginForm: 'loginForm',
             closeModal: 'close-modal',
              loginError: 'loginError'
        };
        const MATCH_SLOTS = 8;
         const FAVORITE_PREDICTIONS_KEY = 'favoritePredictions';
        const FAVORITE_MATCH_KEY = 'favoriteMatch';
        const LOGGED_IN_USER_KEY = 'loggedInUser';

        // Teams data
         const TEAMS = [
            { id: "arsenal", name: "London Ágyúk", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t3.png", weight: 1.0, league: "premier-league" },
            { id: "astonvilla", name: "Aston Oroszlán", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t7.png", league: "premier-league" },
            { id: "brentford", name: "Brentford", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t94.png", league: "premier-league" },
            { id: "brighton", name: "Brighton", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t36.png", league: "premier-league" },
            { id: "chelsea", name: "Chelsea", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t8.png", weight: 0.9, league: "premier-league" },
            { id: "palace", name: "Crystal Palace", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t31.png", league: "premier-league" },
            { id: "everton", name: "Everton", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t11.png", league: "premier-league" },
            { id: "fulham", name: "Fulham", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t54.png", league: "premier-league" },
            { id: "liverpool", name: "Liverpool", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t14.png", weight: 0.9, league: "premier-league" },
            { id: "mancity", name: "Manchester Kék", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t43.png", weight: 0.8, league: "premier-league" },
            { id: "newcastle", name: "Newcastle", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t4.png", league: "premier-league" },
            { id: "nottingham", name: "Nottingham", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t17.png", league: "premier-league" },
            { id: "tottenham", name: "Tottenham", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t6.png", weight: 1.1, league: "premier-league" },
            { id: "manutd", name: "Vörös Ördögök", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t1.png", weight: 0.9, league: "premier-league" },
            { id: "westham", name: "West Ham", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t21.png", league: "premier-league" },
            { id: "wolves", name: "Wolverhampton", logoUrl: "https://resources.premierleague.com/premierleague/badges/50/t39.png", league: "premier-league" },
            // Add more teams from other leagues here
        ].sort((a, b) => a.name.localeCompare(b.name));


        // Global variables
        let timeLeft = TIMER_DURATION;
        let selectedMatches = Array(MATCH_SLOTS).fill(null).map(() => ({ homeTeam: null, awayTeam: null }));
         let favoritePredictions = [];
        let favoriteMatch = null;
        let predictions = [];
        let recentPredictions = [];
        let userSettings = {
            darkMode: false,
            language: 'hu',
            notificationsEnabled: true
        };
        let loggedInUser = null;

        // Utility functions
        function getDOMElement(id) {
            return document.getElementById(id);
        }

        function updateTimer(timeLeft) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            getDOMElement(DOM_ELEMENT_IDS.timer).textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        function showLoadingState() {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'loadingState';
            loadingDiv.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50';
            loadingDiv.innerHTML = '<div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#CCFF00]"></div>';
            document.body.appendChild(loadingDiv);
        }

        function hideLoadingState() {
            const loadingDiv = document.getElementById('loadingState');
            if (loadingDiv) {
                loadingDiv.remove();
            }
        }

        function displayErrorMessage(message) {
             const errorContainer = document.createElement('div');
            errorContainer.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
            errorContainer.textContent = message;
            document.body.appendChild(errorContainer);

            setTimeout(() => {
                errorContainer.style.animation = 'fadeOut 0.3s ease-in forwards';
                setTimeout(() => {
                    errorContainer.remove();
                }, 300)
            }, 5000);
        }

        function positionTooltips() {
            const tooltips = document.querySelectorAll('.tooltip');
            tooltips.forEach(tooltip => {
                const tooltiptext = tooltip.querySelector('.tooltiptext');
                if (tooltiptext) {
                    tooltiptext.style.width = 'auto';
                    tooltiptext.style.whiteSpace = 'normal';
                    const tooltipRect = tooltiptext.getBoundingClientRect();
                    tooltiptext.style.marginLeft = `${-tooltipRect.width / 2}px`;

                    const rect = tooltip.getBoundingClientRect();
                    if (rect.left + tooltipRect.width > window.innerWidth) {
                        tooltiptext.style.left = 'auto';
                        tooltiptext.style.right = '0';
                        tooltiptext.style.marginLeft = '0';
                    }
                }
            });
        }

        // Main functions
        function isTeamSelected(teamId) {
            return selectedMatches.some(match =>
                (match?.homeTeam?.id === teamId) ||
                (match?.awayTeam?.id === teamId)
            );
        }

        function handleTeamSelect(index, position, teamId) {
            const team = TEAMS.find(t => t.id === teamId);
            selectedMatches[index] = {
                ...selectedMatches[index],
                [position === 'home' ? 'homeTeam' : 'awayTeam']: team || null
            };
            updateTeamSelects();
            updateRunPredictionsButton();
            updateTeamLogo(index, position, team);
             updateFooterFavorite();
        }

        function updateTeamSelects() {
            selectedMatches.forEach((match, index) => {
                const homeSelect = document.getElementById(`homeTeam${index}`);
                const awaySelect = document.getElementById(`awayTeam${index}`);

                TEAMS.forEach(team => {
                    const homeOption = homeSelect.querySelector(`option[value="${team.id}"]`);
                    const awayOption = awaySelect.querySelector(`option[value="${team.id}"]`);

                    const isHomeSelected = match.homeTeam?.id === team.id;
                    const isAwaySelected = match.awayTeam?.id === team.id;
                    const isAlreadySelected = isTeamSelected(team.id);

                    if (homeOption) {
                        homeOption.disabled = isAlreadySelected && !isHomeSelected;
                    }
                    if (awayOption) {
                        awayOption.disabled = isAlreadySelected && !isAwaySelected;
                    }
                });

                if (homeSelect) {
                    homeSelect.querySelector('option[value=""]').disabled = false;
                }
                if (awaySelect) {
                    awaySelect.querySelector('option[value=""]').disabled = false;
                }
            });
        }

        function updateTeamLogo(index, position, team) {
            const logoElement = document.getElementById(`${position}TeamLogo${index}`);
            if (team) {
                logoElement.src = team.logoUrl;
                logoElement.alt = `${team.name} Logo`;
                logoElement.classList.remove('hidden');
            } else {
                logoElement.src = '';
                logoElement.alt = '';
                logoElement.classList.add('hidden');
            }
        }

        function updateRunPredictionsButton() {
            const button = getDOMElement(DOM_ELEMENT_IDS.runPredictionsButton);
            button.disabled = !selectedMatches.some(match => match?.homeTeam && match?.awayTeam) || timeLeft <= 0;
        }

        function createMatchSelector() {
            const matchGrid = getDOMElement(DOM_ELEMENT_IDS.matchGrid);
            matchGrid.innerHTML = '';
            selectedMatches.forEach((match, index) => {
                const matchDiv = document.createElement('div');
                matchDiv.className = 'bg-white/5 p-4 rounded-xl';
                matchDiv.innerHTML = `
                    <div class="flex items-center mb-2">
                        <select id="homeTeam${index}" class="w-full p-2 bg-[#141414] border border-[#CCFF00]/20 rounded-md text-white" aria-label="Select home team">
                            <option value="">Válassz hazai csapatot</option>
                            ${TEAMS.map(team => `<option value="${team.id}">${team.name}</option>`).join('')}
                        </select>
                        <img id="homeTeamLogo${index}" src="" alt="" class="w-8 h-8 ml-2 hidden">
                    </div>
                    <div class="flex items-center">
                        <select id="awayTeam${index}" class="w-full p-2 bg-[#141414] border border-[#CCFF00]/20 rounded-md text-white" aria-label="Select away team">
                            <option value="">Válassz vendég csapatot</option>
                            ${TEAMS.map(team => `<option value="${team.id}">${team.name}</option>`).join('')}
                        </select>
                        <img id="awayTeamLogo${index}" src="" alt="" class="w-8 h-8 ml-2 hidden">
                    </div>
                `;
                matchGrid.appendChild(matchDiv);

                const homeSelect = document.getElementById(`homeTeam${index}`);
                const awaySelect = document.getElementById(`awayTeam${index}`);

                homeSelect.addEventListener('change', (e) => handleTeamSelect(index, 'home', e.target.value));
                awaySelect.addEventListener('change', (e) => handleTeamSelect(index, 'away', e.target.value));
            });
            updateTeamSelects();
        }

        function startTimer() {
            updateTimer(timeLeft);
            const timer = setInterval(() => {
                timeLeft--;
                updateTimer(timeLeft);
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    getDOMElement(DOM_ELEMENT_IDS.runPredictionsButton).disabled = true;
                }
            }, 1000);
        }

        function showRecentPredictions() {
            const mainContent = getDOMElement(DOM_ELEMENT_IDS.mainContent);
            mainContent.innerHTML = `
                <div class="bg-[#141414]/50 backdrop-blur-md border border-[#CCFF00]/20 rounded-2xl p-6 mb-8">
                    <h2 class="text-2xl font-bold mb-6 text-[#CCFF00]">Legutóbbi predikciók</h2>
                    <div id="recentPredictionsContent" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        ${recentPredictions.map(prediction => {
                if (!prediction?.match?.homeTeam || !prediction?.match?.awayTeam || !prediction?.teamAnalysis) {
                    return '';
                }

                return `
                                <div class="bg-white/5 p-4 rounded-xl">
                                    <div class="flex justify-between items-center mb-2">
                                        <img src="${prediction.match.homeTeam.logoUrl}" alt="${prediction.match.homeTeam.name} Logo" class="w-8 h-8">
                                        <span class="text-lg font-semibold">vs</span>
                                        <img src="${prediction.match.awayTeam.logoUrl}" alt="${prediction.match.awayTeam.name} Logo" class="w-8 h-8">
                                    </div>
                                    <p class="text-center">${prediction.match.homeTeam.name} vs ${prediction.match.awayTeam.name}</p>
                                    <p class="text-center text-sm text-[#CCFF00]">Prediction Score: ${prediction.teamAnalysis.predictionScore?.toFixed(2) ?? 'N/A'}</p>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        }


        function showSettings() {
            const mainContent = document.getElementById('mainContent');
            mainContent.innerHTML = `
                <div class="bg-[#141414]/50 backdrop-blur-md border border-[#CCFF00]/20 rounded-2xl p-6 mb-8">
                    <h2 class="text-2xl font-bold mb-6 text-[#CCFF00]">Beállítások</h2>
                    <div id="settingsContent" class="space-y-4">
                        <div class="flex items-center justify-between">
                            <label for="darkModeToggle" class="text-lg">Sötét mód</label>
                            <input type="checkbox" id="darkModeToggle" class="toggle" ${userSettings.darkMode ? 'checked' : ''}>
                        </div>
                        <div class="flex items-center justify-between">
                            <label for="languageSelect" class="Nyelv</label>
                            <select id="languageSelect" class="bg-[#141414] border border-[#CCFF00]/20 rounded-md text-white p-2">
                                <option value="hu" ${userSettings.language === 'hu' ? 'selected' : ''}>Magyar</option>
                                <option value="en" ${userSettings.language === 'en' ? 'selected' : ''}>English</option>
                            </select>
                        </div>
                        <div class="flex items-center justify-between">
                            <label for="notificationsToggle" class="text-lg">Értesítések</label>
                            <input type="checkbox" id="notificationsToggle" class="toggle" ${userSettings.notificationsEnabled ? 'checked' : ''}>
                        </div>
                    </div>
                </div>
            `;

            // Add event listeners for settings changes
            document.getElementById('darkModeToggle').addEventListener('change', (e) => {
                userSettings.darkMode = e.target.checked;
                saveUserSettings();
                toggleDarkMode();
            });

            document.getElementById('languageSelect').addEventListener('change', (e) => {
                userSettings.language = e.target.value;
                saveUserSettings();
                // Implement language change logic here
            });

            document.getElementById('notificationsToggle').addEventListener('change', (e) => {
                userSettings.notificationsEnabled = e.target.checked;
                saveUserSettings();
                // Implement notifications toggle logic here
            });
        }

        function safeLocalStorage(operation, key, value = null) {
            try {
                if (operation === 'get') {
                    return localStorage.getItem(key);
                } else if (operation === 'set') {
                    localStorage                    .setItem(key, value);
                }
            } catch (error) {
                console.error(`localStorage ${operation} failed:`, error);
                return null;
            }
        }

        function saveUserSettings() {
            safeLocalStorage('set', 'userSettings', JSON.stringify(userSettings));
        }

        function loadUserSettings() {
            const savedSettings = safeLocalStorage('get', 'userSettings');
            if (savedSettings) {
                try {
                    userSettings = JSON.parse(savedSettings);
                } catch (error) {
                    console.error('Failed to parse user settings:', error);
                    userSettings = {
                        darkMode: false,
                        language: 'hu',
                        notificationsEnabled: true
                    };
                }
            }
        }

        function toggleDarkMode() {
            document.documentElement.classList.toggle('dark', userSettings.darkMode);
        }

        function updateFooterFavorite() {
           const footerFavorite = getDOMElement(DOM_ELEMENT_IDS.footerFavorite);
            const favoriteCount = favoritePredictions.length;

            if (favoriteCount > 0) {
                footerFavorite.innerHTML = `
                    <span class="text-sm">Kedvencek száma: </span>
                    <span class="font-semibold">${favoriteCount}</span>
                `;
            } else {
                footerFavorite.innerHTML = '<span class="text-sm">Nincs kiválasztott kedvenc mérkőzés</span>';
            }
        }

        function handleFooterFavoriteSelect(match) {
            favoriteMatch = match;
            localStorage.setItem(FAVORITE_MATCH_KEY, JSON.stringify(favoriteMatch));
            updateFooterFavorite();
        }

        function loadFavoriteMatch() {
            const savedFavoriteMatch = localStorage.getItem(FAVORITE_MATCH_KEY);
            if (savedFavoriteMatch) {
                favoriteMatch = JSON.parse(savedFavoriteMatch);
            }
        }
         function loadFavoritePredictions() {
            const savedFavorites = safeLocalStorage('get', FAVORITE_PREDICTIONS_KEY);
             if (savedFavorites) {
                try {
                    favoritePredictions = JSON.parse(savedFavorites);
                } catch (error) {
                    console.error('Failed to parse favorite predictions:', error);
                     favoritePredictions = [];
                 }
            }
        }

          function handleFavoriteToggle(prediction) {
              const index = favoritePredictions.findIndex(fav => fav.match.homeTeam.id === prediction.match.homeTeam.id && fav.match.awayTeam.id === prediction.match.awayTeam.id);

              if (index === -1) {
                  favoritePredictions.push(prediction);
              } else {
                  favoritePredictions.splice(index, 1);
              }
                saveFavoritePredictions();
                updateFooterFavorite();
                displayPredictions();
        }

          function saveFavoritePredictions() {
            safeLocalStorage('set', FAVORITE_PREDICTIONS_KEY, JSON.stringify(favoritePredictions));
        }

        function isMatchFavorite(prediction) {
             return favoritePredictions.some(fav => fav.match.homeTeam.id === prediction.match.homeTeam.id && fav.match.awayTeam.id === prediction.match.awayTeam.id);
        }

        function calculatePredictionScore(data) {
            const weights = {
                headToHead: 0.25,
                form: 0.20,
                expectedGoals: 0.20,
                modelPredictions: 0.35
            };

            let score = 0;

            // Head-to-head
            const homeWinPercentage = data.team_analysis.head_to_head_stats.home_win_percentage || 0;
            const headToHeadScore = homeWinPercentage / 100;
            score += headToHeadScore * weights.headToHead;

            // Form
            const homeFormIndex = data.team_analysis.home_form_index || 0;
            const awayFormIndex = data.team_analysis.away_form_index || 0;
            const formDifference = (homeFormIndex - awayFormIndex) / 100;
            const formScore = (formDifference + 1) / 2;  // Normalize to 0-1
            score += formScore * weights.form;

            // Expected goals
            const homeExpectedGoals = data.prediction.homeExpectedGoals || 0;
            const awayExpectedGoals = data.prediction.awayExpectedGoals || 0;
            const expectedGoalsDifference = homeExpectedGoals - awayExpectedGoals;
            const expectedGoalsScore = (expectedGoalsDifference + 4) / 8;  // Normalize to 0-1, assuming max difference of 4
            score += expectedGoalsScore * weights.expectedGoals;

            // Model predictions
            let modelScore = 0;
            if (data.prediction.modelPredictions.randomForest === "home_win") modelScore += 1;
            if (data.prediction.modelPredictions.poisson.homeGoals > data.prediction.modelPredictions.poisson.awayGoals) modelScore += 1;
            modelScore += data.prediction.modelPredictions.elo.homeWinProb;
            modelScore /= 3; // Average of the three model predictions
            score += modelScore * weights.modelPredictions;


            return score * 10; // Scale to 0-10
        }
        function runPredictions() {
            const validMatches = selectedMatches.filter(match => match?.homeTeam && match?.awayTeam);

            if (validMatches.length === 0) {
                displayErrorMessage('Kérjük, válasszon ki legalább egy teljes mérkőzést!');
                return;
            }

            const button = getDOMElement(DOM_ELEMENT_IDS.runPredictionsButton);
            button.disabled = true;
            button.textContent = 'Predikciók futtatása...';

            showLoadingState();
            const fetchPromises = validMatches.map(match => {
                const apiUrl = `${API_BASE_URL}?home_team=${match.homeTeam.name}&away_team=${match.awayTeam.name}`;
                return fetch(apiUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        const predictionScore = calculatePredictionScore(data);
                        return { ...data, match: match, teamAnalysis: { ...data.team_analysis, predictionScore } };
                    })
                    .catch(error => {
                        console.error("Error fetching data:", error);
                        displayErrorMessage('Hiba történt az adatok lekérésekor!');
                        return null;
                    });
            });

            Promise.all(fetchPromises)
                .then(results => {
                    predictions = results.filter(Boolean);
                    displayPredictions();
                    saveRecentPredictions(predictions);
                    hideLoadingState();
                    button.disabled = false;
                    button.textContent = 'Predikciók futtatása';
                })
                .catch(error => {
                    console.error('Error in runPredictions:', error);
                    displayErrorMessage('Hiba történt a predikciók futtatása közben');
                    hideLoadingState();
                    button.disabled = false;
                    button.textContent = 'Predikciók futtatása';
                });
        }

        function displayPredictions() {
            const predictionResults = getDOMElement(DOM_ELEMENT_IDS.predictionResults);
            const predictionGrid = getDOMElement(DOM_ELEMENT_IDS.predictionGrid);
            const sortSelect = document.getElementById('sortPredictions');
            const sortValue = sortSelect.value;

             const sortedPredictions = [...predictions].sort((a, b) => {
                 if(sortValue === 'matchName') {
                    const nameA = `${a.match.homeTeam.name} vs ${a.match.awayTeam.name}`.toLowerCase();
                    const nameB = `${b.match.homeTeam.name} vs ${b.match.awayTeam.name}`.toLowerCase();
                     return nameA.localeCompare(nameB);
                }
                if (sortValue === 'predictionScore') {
                    return (b.teamAnalysis.predictionScore || 0) - (a.teamAnalysis.predictionScore || 0);
                }
                 if (sortValue === 'averageGoals') {
                    return (b.teamAnalysis.average_goals.average_total_goals || 0) - (a.teamAnalysis.average_goals.average_total_goals || 0);
                }
                if (sortValue === 'btts') {
                    return (b.teamAnalysis.both_teams_scored_percentage || 0) - (a.teamAnalysis.both_teams_scored_percentage || 0);
                }

                return 0;
            });


            predictionGrid.innerHTML = '';

             sortedPredictions.forEach((prediction, index) => {
                if (!prediction?.match?.homeTeam || !prediction?.match?.awayTeam || !prediction?.teamAnalysis) {
                    return;
                }
                const isFavorite = isMatchFavorite(prediction);
                 const predictionDiv = document.createElement('div');
                predictionDiv.className = `prediction-card bg-[#1A1A1A]/50 backdrop-blur-md border border-[#CCFF00]/20 rounded-xl p-4 ${index < 3 ? 'ring-2 ring-[#CCFF00]' : ''}`;
                predictionDiv.style.animationDelay = `${Math.random() * 200}ms`;
                predictionDiv.innerHTML = `
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-center text-lg font-semibold">Premier League Head-to-Head</h3>
                        <i class="ri-star-${isFavorite ? 'fill' : 'line'} favorite-btn text-2xl ${isFavorite ? 'active' : ''}"  data-prediction-id="${index}"></i>
                    </div>
                    <div class="flex justify-between items-center mb-4">
                        <div class="text-center">
                            <img src="${prediction.match.homeTeam.logoUrl}" alt="${prediction.match.homeTeam.name}" width="60" height="60" class="mx-auto mb-2 team-logo" loading="lazy" role="img" aria-label="${prediction.match.homeTeam.name} Logo">
                            <span class="text-sm">${prediction.match.homeTeam.name}</span>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-[#CCFF00]">${prediction.teamAnalysis.matches_count}</div>
                            <div class="text-xs">Matches</div>
                        </div>
                        <div class="text-center">
                            <img src="${prediction.match.awayTeam.logoUrl}" alt="${prediction.match.awayTeam.name}" width="60" height="60" class="mx-auto mb-2 team-logo" loading="lazy" role="img" aria-label="${prediction.match.awayTeam.name} Logo">
                            <span class="text-sm">${prediction.match.awayTeam.name}</span>
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <div class="text-center tooltip">
                            <div class="text-xl font-bold">${prediction.teamAnalysis.head_to_head_stats.home_wins}</div>
                            <div class="text-xs">Home Wins</div>
                            <div class="text-sm">${(prediction.teamAnalysis.head_to_head_stats.home_wins / prediction.teamAnalysis.matches_count * 100).toFixed(1)}%</div>
                            <span class="tooltiptext">Number of times the home team has won in their head-to-head matches</span>
                        </div>
                        <div class="text-center tooltip">
                            <div class="text-xl font-bold">${prediction.teamAnalysis.head_to_head_stats.draws}</div>
                            <div class="text-xs">Draws</div>
                            <div class="text-sm">${(prediction.teamAnalysis.head_to_head_stats.draws / prediction.teamAnalysis.matches_count * 100).toFixed(1)}%</div>
                            <span class="tooltiptext">Number of times these teams have drawn in their head-to-head matches</span>
                        </div>
                        <div class="text-center tooltip">
                            <div class="text-xl font-bold">${prediction.teamAnalysis.head_to_head_stats.away_wins}</div>
                            <div class="text-xs">Away Wins</div>
                            <div class="text-sm">${(prediction.teamAnalysis.head_to_head_stats.away_wins / prediction.teamAnalysis.matches_count * 100).toFixed(1)}%</div>
                            <span class="tooltiptext">Number of times the away team has won in their head-to-head matches</span>
                        </div>
                    </div>
                    <div class="mb-4">
                        <div class="flex justify-between mb-2">
                            <div class="tooltip">
                                <div class="text-xs">Home</div>
                                <div class="text-sm">${prediction.teamAnalysis.average_goals.average_home_goals}</div>
                                <span class="tooltiptext">Average goals scored by the home team in their matches</span>
                            </div>
                            <div class="text-center tooltip">
                                <div class="text-xs">Avg. Goals</div>
                                <div class="text-xl font-bold text-[#CCFF00]">${prediction.teamAnalysis.average_goals.average_total_goals}</div>
                                <span class="tooltiptext">Average total goals scored in matches involving these teams</span>
                            </div>
                            <div class="text-right tooltip">
                                <div class="text-xs">Away</div>
                                <div class="text-sm">${prediction.teamAnalysis.average_goals.average_away_goals}</div>
                                <span class="tooltiptext">Average goals scored by the away team in their matches</span>
                            </div>
                        </div>
                    </div>
                    <div class="mb-4">
                        <div class="flex justify-between mb-1">
                            <span class="text-sm tooltip">
                                Both Teams Scored
                                <span class="tooltiptext">Percentage of matches where both teams scored at least one goal</span>
                            </span>
                            <span class="text-sm">${prediction.teamAnalysis.both_teams_scored_percentage}%</span>
                        </div>
                        <div class="w-full bg-white/10 rounded-full h-2">
                            <div
                                class="bg-[#CCFF00] h-2 rounded-full"
                                style="width: ${prediction.teamAnalysis.both_teams_scored_percentage}%"
                            ></div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center tooltip">
                            <div class="text-xs">Home Form Index</div>
                            <div class="text-lg font-bold text-[#CCFF00]">${prediction.teamAnalysis.home_form_index}%</div>
                            <span class="tooltiptext">A measure of the home team's recent performance</span>
                        </div>
                        <div class="text-center tooltip">
                            <div class="text-xs">Away Form Index</div>
                            <div class="text-lg font-bold text-[#CCFF00]">${prediction.teamAnalysis.away_form_index}%</div>
                            <span class="tooltiptext">A measure of the away team's recent performance</span>
                        </div>
                    </div>
                     <div class="mt-4 text-center">
                         <div class="text-sm text-[#CCFF00]">Prediction Score: <span class="font-bold text-base">${prediction.teamAnalysis.predictionScore?.toFixed(2) ?? 'N/A'}</span></div>
                    </div>
                `;
                predictionGrid.appendChild(predictionDiv);
                  const favoriteButton = predictionDiv.querySelector('.favorite-btn');
                    favoriteButton.addEventListener('click', () => {
                        handleFavoriteToggle(prediction);
                    });
            });

            predictionResults.classList.remove('hidden');
            positionTooltips();
        }
        function saveRecentPredictions(predictions) {
            recentPredictions = predictions.slice(0, 5);
            localStorage.setItem('recentPredictions', JSON.stringify(recentPredictions));
        }

        function loadRecentPredictions() {
            const savedPredictions = localStorage.getItem('recentPredictions');
            if (savedPredictions) {
                recentPredictions = JSON.parse(savedPredictions);
            }
        }

         function authenticateUser(email, password) {
            // Mock authentication logic
            if (email === 'takosadam@gmail.com' && password === 'takosadam') {
                loggedInUser = { email: email, username: 'takosadam' };
                localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(loggedInUser));
                return true;
            } else {
                return false;
            }
        }

        function checkAuthentication() {
           const storedUser = localStorage.getItem(LOGGED_IN_USER_KEY);
            if (storedUser) {
                loggedInUser = JSON.parse(storedUser);
                 updateUserDisplay();
                 return true;
             } else {
              return false;
             }
        }

        function updateUserDisplay() {
            const usernameDisplay = getDOMElement(DOM_ELEMENT_IDS.username);
            const userProfileDiv = getDOMElement(DOM_ELEMENT_IDS.userProfile);
             const logoutButton = getDOMElement(DOM_ELEMENT_IDS.logoutBtn);
             const loginButton = getDOMElement(DOM_ELEMENT_IDS.loginBtn);
             const loggedInUsername = getDOMElement(DOM_ELEMENT_IDS.loggedInUsername);


            if (loggedInUser) {
                usernameDisplay.classList.add('hidden');
                loginButton.classList.add('hidden');
                 loggedInUsername.textContent = loggedInUser.username;
                 userProfileDiv.classList.remove('hidden');

                 logoutButton.addEventListener('click', handleLogout);
            } else {
                usernameDisplay.classList.remove('hidden');
                loginButton.classList.remove('hidden');
                 userProfileDiv.classList.add('hidden');
                 logoutButton.removeEventListener('click', handleLogout);
            }
        }

        function handleLogout() {
           loggedInUser = null;
            localStorage.removeItem(LOGGED_IN_USER_KEY);
           updateUserDisplay();
        }

         function handleLoginModal() {
            const loginModal = getDOMElement(DOM_ELEMENT_IDS.loginModal);
            loginModal.style.display = "block";
        }

        function closeModal() {
           const loginModal = getDOMElement(DOM_ELEMENT_IDS.loginModal);
            loginModal.style.display = "none";
        }

        function handleLoginForm(event) {
           event.preventDefault();
             const emailInput = getDOMElement('loginEmail');
            const passwordInput = getDOMElement('loginPassword');
            const loginError = getDOMElement(DOM_ELEMENT_IDS.loginError);

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                loginError.textContent = 'Please enter both email and password';
                loginError.classList.remove('hidden');
                return;
            }

           if (authenticateUser(email, password)) {
                updateUserDisplay();
                 closeModal();
                 loginError.classList.add('hidden');
            } else {
                loginError.textContent = 'Invalid email or password';
                loginError.classList.remove('hidden');
            }
        }

        // Event listeners and initialization
        document.addEventListener('DOMContentLoaded', () => {
            createMatchSelector();
            startTimer();
            getDOMElement(DOM_ELEMENT_IDS.runPredictionsButton).addEventListener('click', runPredictions);
            positionTooltips();

             // Navigation handlers
            const navigationLinks = {
                'homeLink': () => {
                    getDOMElement(DOM_ELEMENT_IDS.matchSelection).scrollIntoView({ behavior: 'smooth' });
                    getDOMElement(DOM_ELEMENT_IDS.mainContent).innerHTML = '';
                    createMatchSelector();
                     document.getElementById('statisticsSection').classList.add('hidden');
                },
                'statisticsLink': showStatistics,
                'favoritedStatisticsLink': showFavoritedStatistics,
                'recentLink': showRecentPredictions,
                'settingsLink': showSettings
            };

             Object.entries(navigationLinks).forEach(([id, handler]) => {
                const element = getDOMElement(id);
                if (element) {
                    element.addEventListener('click', (e) => {
                        e.preventDefault();
                        handler();
                    });
                }
            });

            // Initialize all required functionality
             createMatchSelector();
            startTimer();
            loadRecentPredictions();
            loadUserSettings();
            loadFavoriteMatch();
            loadFavoritePredictions();
            updateFooterFavorite();
             checkAuthentication();

             // Add click handler for predictions button
            const predictionsButton = getDOMElement(DOM_ELEMENT_IDS.runPredictionsButton);
            if (predictionsButton) {
                predictionsButton.addEventListener('click', runPredictions);
            }

            // Initialize dark mode if needed
            if (userSettings.darkMode) {
                toggleDarkMode();
            }

            // Add event listener for login/logout button
            getDOMElement(DOM_ELEMENT_IDS.loginBtn).addEventListener('click', handleLoginModal);

              // Add event listener for login form submission
            const loginForm = getDOMElement(DOM_ELEMENT_IDS.loginForm);
            if (loginForm) {
                loginForm.addEventListener('submit', handleLoginForm);
            }

             // Add event listener for close modal
            const closeModalButton = getDOMElement(DOM_ELEMENT_IDS.closeModal);
            if (closeModalButton) {
                closeModalButton.addEventListener('click', closeModal);
            }

           window.addEventListener('click', function(event) {
                const loginModal = getDOMElement(DOM_ELEMENT_IDS.loginModal);
               if (event.target === loginModal) {
                    closeModal();
                }
            });

             // Add event listeners for search and filter
            getDOMElement(DOM_ELEMENT_IDS.searchMatches).addEventListener('input', filterMatches);
            getDOMElement(DOM_ELEMENT_IDS.leagueFilter).addEventListener('change', filterMatches);
        });

         window.addEventListener('resize', positionTooltips);

        function filterMatches() {
            const searchTerm = getDOMElement(DOM_ELEMENT_IDS.searchMatches).value.toLowerCase();
            const leagueFilter = getDOMElement(DOM_ELEMENT_IDS.leagueFilter).value;

            const filteredTeams = TEAMS.filter(team =>
                team.name.toLowerCase().includes(searchTerm) &&
                (leagueFilter === '' || team.league === leagueFilter)
            );

            updateMatchSelector(filteredTeams);
        }

        function updateMatchSelector(filteredTeams) {
            const matchGrid = getDOMElement(DOM_ELEMENT_IDS.matchGrid);
            matchGrid.innerHTML = '';

            selectedMatches.forEach((match, index) => {
                const matchDiv = document.createElement('div');
                matchDiv.className = 'bg-white/5 p-4 rounded-xl';
                matchDiv.innerHTML = `
                    <div class="flex items-center mb-2">
                        <select id="homeTeam${index}" class="w-full p-2 bg-[#141414] border border-[#CCFF00]/20 rounded-md text-white" aria-label="Select home team">
                            <option value="">Válassz hazai csapatot</option>
                            ${filteredTeams.map(team => `<option value="${team.id}" ${match.homeTeam?.id === team.id ? 'selected' : ''}>${team.name}</option>`).join('')}
                        </select>
                        <img id="homeTeamLogo${index}" src="${match.homeTeam?.logoUrl || ''}" alt="${match.homeTeam?.name || ''}" class="w-8 h-8 ml-2 ${match.homeTeam ? '' : 'hidden'}">
                    </div>
                    <div class="flex items-center">
                        <select id="awayTeam${index}" class="w-full p-2 bg-[#141414] border border-[#CCFF00]/20 rounded-md text-white" aria-label="Select away team">
                            <option value="">Válassz vendég csapatot</option>
                            ${filteredTeams.map(team => `<option value="${team.id}" ${match.awayTeam?.id === team.id ? 'selected' : ''}>${team.name}</option>`).join('')}
                        </select>
                        <img id="awayTeamLogo${index}" src="${match.awayTeam?.logoUrl || ''}" alt="${match.awayTeam?.name || ''}" class="w-8 h-8 ml-2 ${match.awayTeam ? '' : 'hidden'}">
                    </div>
                `;
                matchGrid.appendChild(matchDiv);

                const homeSelect = document.getElementById(`homeTeam${index}`);
                const awaySelect = document.getElementById(`awayTeam${index}`);

                homeSelect.addEventListener('change', (e) => handleTeamSelect(index, 'home', e.target.value));
                awaySelect.addEventListener('change', (e) => handleTeamSelect(index, 'away', e.target.value));
            });

            updateTeamSelects();
        }

         function showStatistics() {
            const mainContent = document.getElementById('mainContent');
            const statisticsSection = document.getElementById('statisticsSection');

            mainContent.innerHTML = '';
            statisticsSection.classList.remove('hidden');
            mainContent.appendChild(statisticsSection);

            updateStatistics();
            renderCharts();
        }
         function showFavoritedStatistics() {
            const mainContent = document.getElementById('mainContent');
            const statisticsSection = document.getElementById('statisticsSection');

            mainContent.innerHTML = '';
             statisticsSection.classList.remove('hidden');
            mainContent.appendChild(statisticsSection);

           calculateFavoritedStatistics();
            renderCharts();
        }
        function calculateFavoritedStatistics() {
            document.getElementById('totalPredictions').textContent = favoritePredictions.length;
            document.getElementById('averageGoals').textContent = calculateAverageGoals(favoritePredictions);
            document.getElementById('mostCommonResult').textContent = getMostCommonResult(favoritePredictions);
            document.getElementById('avgPredictionScore').textContent = calculateAveragePredictionScore(favoritePredictions).toFixed(2);
            document.getElementById('homeWinPercentage').textContent = calculateHomeWinPercentage(favoritePredictions).toFixed(2) + '%';
            document.getElementById('bttsPercentage').textContent = calculateBTTSPercentage(favoritePredictions).toFixed(2) + '%';
        }

        function updateStatistics() {
            document.getElementById('totalPredictions').textContent = predictions.length;
            document.getElementById('averageGoals').textContent = calculateAverageGoals();
            document.getElementById('mostCommonResult').textContent = getMostCommonResult();
            document.getElementById('avgPredictionScore').textContent = calculateAveragePredictionScore().toFixed(2);
            document.getElementById('homeWinPercentage').textContent = calculateHomeWinPercentage().toFixed(2) + '%';
            document.getElementById('bttsPercentage').textContent = calculateBTTSPercentage().toFixed(2) + '%';
        }

        function renderCharts() {
            renderPredictionScoreDistribution();
            renderGoalsDistribution();
            renderFormIndexTrend();
            renderResultDistribution();
        }

        function renderPredictionScoreDistribution() {
             const ctx = document.getElementById('predictionScoreDistribution').getContext('2d');
            const data = calculatePredictionScoreDistribution();

            if (window.predictionScoreChart) {
                window.predictionScoreChart.destroy();
            }
            window.predictionScoreChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['0-2', '2-4', '4-6', '6-8', '8-10'],
                    datasets: [{
                        label: 'Prediction Score Distribution',
                        data: data,
                         backgroundColor: '#CCFF00',
                    }]
                },
                 options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Prediction Score Distribution'
                        }
                    }
                }
            });
        }

        function renderGoalsDistribution() {
           const ctx = document.getElementById('goalsDistribution').getContext('2d');
           const data = calculateGoalsDistribution();
            if (window.goalsChart) {
                window.goalsChart.destroy();
            }
           window.goalsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['0', '1', '2', '3', '4', '5+'],
                    datasets: [{
                        label: 'Goals Distribution',
                       data: data,
                         borderColor: '#CCFF00',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Goals Distribution'
                        }
                    }
                }
            });
        }

        function renderFormIndexTrend() {
              const ctx = document.getElementById('formIndexTrend').getContext('2d');

            if (window.formIndexTrendChart) {
                window.formIndexTrendChart.destroy();
            }
           window.formIndexTrendChart =  new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                    datasets: [{
                        label: 'Home Form Index',
                        data: calculateFormIndexTrend('home'),
                         borderColor: '#CCFF00',
                        tension: 0.1
                    }, {
                        label: 'Away Form Index',
                        data: calculateFormIndexTrend('away'),
                         borderColor: '#FF00CC',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Form Index Trend'
                        }
                    }
                }
            });
        }

        function renderResultDistribution() {
             const ctx = document.getElementById('resultDistribution').getContext('2d');
             const data = calculateResultDistribution();

            if (window.resultDistributionChart) {
                window.resultDistributionChart.destroy();
            }

            window.resultDistributionChart = new Chart(ctx, {
                type: 'pie',
                data: {
                     labels: ['Home Win', 'Draw', 'Away Win'],
                    datasets: [{
                        label: 'Result Distribution',
                       data: data,
                        backgroundColor: ['#CCFF00', '#FFCC00', '#FF00CC']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Result Distribution'
                        }
                    }
                }
            });
        }

         // Helper functions for calculations
        function calculateAveragePredictionScore(predictionsArray = predictions) {
            return predictionsArray.reduce((sum, pred) => sum + (pred.teamAnalysis.predictionScore || 0), 0) / predictionsArray.length;
        }

        function calculateHomeWinPercentage(predictionsArray = predictions) {
             const homeWins = predictionsArray.filter(pred =>
                pred.teamAnalysis.head_to_head_stats.home_wins > pred.teamAnalysis.head_to_head_stats.away_wins
            ).length;
             return (homeWins / predictionsArray.length) * 100;
        }

        function calculateBTTSPercentage(predictionsArray = predictions) {
            return predictionsArray.reduce((sum, pred) => sum + (pred.teamAnalysis.both_teams_scored_percentage || 0), 0) / predictionsArray.length;
        }

         function calculatePredictionScoreDistribution(predictionsArray = predictions) {
           const distribution = [0, 0, 0, 0, 0];
            predictionsArray.forEach(pred => {
                const score = pred.teamAnalysis.predictionScore || 0;
                const index = Math.min(Math.floor(score / 2), 4);
                distribution[index]++;
            });
            return distribution;
        }

         function calculateGoalsDistribution(predictionsArray = predictions) {
             const distribution = [0, 0, 0, 0, 0, 0];
             predictionsArray.forEach(pred => {
                const goals = pred.teamAnalysis.average_goals.average_total_goals || 0;
                const index = Math.min(Math.floor(goals), 5);
                distribution[index]++;
            });
            return distribution;
        }


        function calculateFormIndexTrend(type) {
            // This is a mock function. In a real scenario, you'd use actual historical data.
            return Array(5).fill(0).map(() => Math.random() * 100);
        }

        function calculateResultDistribution(predictionsArray = predictions) {
            const distribution = [0, 0, 0];
             predictionsArray.forEach(pred => {
                const stats = pred.teamAnalysis.head_to_head_stats;
                if (stats.home_wins >stats.away_wins) distribution[0]++;
                 else if (stats.home_wins < stats.away_wins) distribution[2]++;
                else distribution[1]++;
            });
             return distribution;
        }

         function calculateAverageGoals(predictionsArray = predictions) {
            if (predictionsArray.length === 0) return '0';
             const totalGoals = predictionsArray.reduce((sum, pred) => {
                const avgGoals = parseFloat(pred.teamAnalysis.average_goals.average_total_goals);
                return isNaN(avgGoals) ? sum : sum + avgGoals;
            }, 0);
            return (totalGoals / predictionsArray.length).toFixed(2);
        }

       function getMostCommonResult(predictionsArray = predictions) {
            if (predictionsArray.length === 0) return 'N/A';
            const results = predictionsArray.map(pred => {
                const homeWins = pred.teamAnalysis.head_to_head_stats.home_wins || 0;
                const awayWins = pred.teamAnalysis.head_to_head_stats.away_wins || 0;
                 if (homeWins > awayWins) return 'Home Win';
                if (awayWins > homeWins) return 'Away Win';
                return 'Draw';
            });

             const resultCounts = results.reduce((counts, result) => {
                counts[result] = (counts[result] || 0) + 1;
                 return counts;
            }, {});

             let mostCommon = null;
            let maxCount = 0;

            for (const result in resultCounts) {
                if (resultCounts[result] > maxCount) {
                    mostCommon = result;
                    maxCount = resultCounts[result];
                 }
            }
             return mostCommon || 'N/A';
        }
