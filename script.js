let grass, pademelons, devils, bandicoots, chart;
let season = 0; // 0: Spring, 1: Summer, 2: Autumn, 3: Winter
let seasonDuration = 300; // Reduced duration of each season in frames
let showSeasons = true;
let showDisasters = true;
let disasterDuration = 100; // Reduced duration to show disaster message
let disasterFrame = -disasterDuration; // Frame when the last disaster occurred
let isPaused = false; // Pause state
let grassLimitEnabled = true; // Grass limit state
let points = 0; // Points system
let stabilityCheckFrames = 0;
const stabilityThreshold = 1000; // Increased number of frames to check for stability
const stabilityPoints = 50; // Points awarded for stability
const rangerBadgePoints = 1500; // Points required for Ranger Badge
let rangerBadgeAchieved = false; // Track if Ranger Badge has been achieved
let rangerBadgeMessageShown = false; // Flag to prevent repeated messages

let objectives = [
  { description: "Increase pademelon population to 200", target: 200, achieved: false, points: 200 },
  { description: "Increase pademelon population to 250", target: 250, achieved: false, points: 250 },
  { description: "Increase devil population to 80", target: 80, achieved: false, points: 200 },
  { description: "Increase grass population to 900", target: 900, achieved: false, points: 200 },
  { description: "Survive 8 natural disasters", target: 8, achieved: false, points: 100, count: 0 }, // Initialize count
  { description: "Maintain a stable ecosystem for 4000 frames", target: 4000, achieved: false, points: 100 },
  { description: "Increase bandicoot population to 130", target: 130, achieved: false, points: 200 }
];

let ongoingObjectives = [
  { description: "Maintain grass population above 700 for 800 frames", target: 800, achieved: false, points: 300, type: "grass", condition: (grass) => grass > 700 },
  { description: "Maintain pademelon population above 220 for 800 frames", target: 800, achieved: false, points: 300, type: "pademelons", condition: (pademelons) => pademelons > 220 },
  { description: "Maintain devil population above 70 for 800 frames", target: 800, achieved: false, points: 300, type: "devils", condition: (devils) => devils > 70 },
  { description: "Maintain bandicoot population above 90 for 800 frames", target: 800, achieved: false, points: 300, type: "bandicoots", condition: (bandicoots) => bandicoots > 90 },
  { description: "Maintain a balanced ecosystem for 1500 frames", target: 1500, achieved: false, points: 500, type: "balanced", condition: (grass, pademelons, devils, bandicoots) => grass > 500 && pademelons > 100 && devils > 50 && bandicoots > 100 }
];

let newAchievements = [
  { description: "Ecosystem Guardian: Achieve all ongoing objectives", achieved: false, points: 500 },
  { description: "Disaster Resilience: Survive 20 natural disasters", achieved: false, count: 0, target: 20, points: 200 },
  { description: "Master Ecologist: Maintain a stable ecosystem for 10,000 frames", achieved: false, frames: 0, target: 10000, points: 400 },
  { description: "Population Expert: Achieve grass population of 1500, pademelon population of 350, devil population of 150, and bandicoot population of 200", achieved: false, points: 400 }
];

function updateObjectiveDisplay() {
  const currentObjective = objectives.find(objective => !objective.achieved);
  const currentOngoingObjective = ongoingObjectives.find(objective => !objective.achieved);

  if (currentObjective) {
    document.getElementById("objectiveDisplay").innerText = currentObjective.description;
  } else if (currentOngoingObjective) {
    document.getElementById("objectiveDisplay").innerText = currentOngoingObjective.description;
  } else {
    document.getElementById("objectiveDisplay").innerText = "All objectives achieved! Complete achievements to earn more points.";
  }
}

let pademelonsHistory = [];
let devilsHistory = [];
let bandicootsHistory = [];
const historyLength = 100; // Number of frames to calculate average

let achievements = [
  { description: "Survive 10 natural disasters", achieved: false, count: 0, target: 10, points: 100 },
  { description: "Maintain a stable ecosystem for 5000 frames", achieved: false, frames: 0, target: 5000, points: 50 }
];

// Variables for interpolation
let targetRainfall, targetTemperature;
let currentRainfall, currentTemperature;
const interpolationSpeed = 0.01; // Adjust this value to control the speed of interpolation

function setup() {
  createCanvas(800, 400).parent("canvas-container");
  chart = new Chart(document.getElementById("populationChart"), {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: "Grass (per hectare)", data: [], borderColor: "green", fill: false },
        { label: "Pademelons (per hectare)", data: [], borderColor: "orange", fill: false },
        { label: "Devils (per hectare)", data: [], borderColor: "red", fill: false },
        { label: "Bandicoots (per hectare)", data: [], borderColor: "yellow", fill: false }
      ]
    },
    options: {
      responsive: true,
      animation: false,
      scales: {
        x: { title: { display: true, text: 'Time' }},
        y: { 
          title: { display: true, text: 'Population' },
          min: 0 // Ensuring y-axis starts at 0
        }
      }
    }
  });
  resetSim(); // Initialize the simulation with stable values
  targetRainfall = currentRainfall = parseFloat(document.getElementById("rainfall").value);
  targetTemperature = currentTemperature = parseFloat(document.getElementById("temperature").value);
  console.log("Setup complete");
}

function draw() {
  if (isPaused) {
    return; // Skip the draw loop if paused
  }

  let seasonNames = ["Spring", "Summer", "Autumn", "Winter"];
  let seasonColors = ["#d4f1f4", "#f7d794", "#f5cd79", "#c8d6e5"];
  
  if (showSeasons) {
    background(seasonColors[season]);
  } else {
    background(240);
  }

  // Seasonal Changes
  if (frameCount % seasonDuration === 0) {
    season = (season + 1) % 4;
    document.getElementById("seasonDisplay").innerText = "Season: " + seasonNames[season];
    switch (season) {
      case 0: // Spring
        targetRainfall = 70;
        targetTemperature = 20;
        break;
      case 1: // Summer
        targetRainfall = 30;
        targetTemperature = 35;
        break;
      case 2: // Autumn
        targetRainfall = 50;
        targetTemperature = 15;
        break;
      case 3: // Winter
        targetRainfall = 40;
        targetTemperature = 5;
        break;
    }
  }

  // Interpolate current values towards target values
  currentRainfall += (targetRainfall - currentRainfall) * interpolationSpeed;
  currentTemperature += (targetTemperature - currentTemperature) * interpolationSpeed;

  // Combine seasonal and slider values
  let rainfallElement = document.getElementById("rainfall");
  let temperatureElement = document.getElementById("temperature");
  let invasiveSpeciesElement = document.getElementById("invasiveSpecies");
  let humanImpactElement = document.getElementById("humanImpact");

  console.log(rainfallElement, temperatureElement, invasiveSpeciesElement, humanImpactElement);

  let rainfall = currentRainfall + parseFloat(rainfallElement.value) - 50;
  let temperature = currentTemperature + parseFloat(temperatureElement.value) - 25;
  let invasiveSpecies = parseFloat(invasiveSpeciesElement.value);
  let humanImpact = parseFloat(humanImpactElement.value); // Add human impact slider value

  // Ecosystem Dynamics
  grass += (rainfall / 15 - invasiveSpecies) - (50 - rainfall) / 10; // Adjusted growth rate for grass

  // Pademelons
  pademelons += grass / 150 - devils / 10 - humanImpact - temperature / 8;
  if (temperature > 30) {
    pademelons -= (temperature - 30) / 5; // Higher reduction for high temperatures
  }
  if (invasiveSpecies > 5) {
    pademelons -= invasiveSpecies / 10; // Moderate reduction for invasive species
  }

  // Devils
  let devilGrowth = (pademelons / 60 + bandicoots / 40) * (1 - devils / (pademelons + bandicoots + 1)) - temperature / 10 - humanImpact / 5;
  if (temperature < 10 || temperature > 35) {
    devilGrowth -= Math.abs(temperature - 22) / 10; // Wider tolerance but still affected by extremes
  }
  if (humanImpact > 5) {
    devilGrowth -= humanImpact / 5; // High reduction for human impact
  }
  devils += devilGrowth;

  // Bandicoots
  let bandicootGrowth = (grass / 250 + pademelons / 40) * (1 - bandicoots / (grass + 1)) - devils / 8 - invasiveSpecies / 8 - humanImpact / 5; // Increased impact of human activities
  if (temperature > 25) {
    bandicootGrowth -= (temperature - 25) / 5; // Sensitive to high temperatures
  }
  if (invasiveSpecies > 5) {
    bandicootGrowth -= invasiveSpecies / 5; // High reduction for invasive species
  }
  if (humanImpact > 5) {
    bandicootGrowth -= humanImpact / 5; // High reduction for human impact
  }
  bandicoots += bandicootGrowth;

  // Cap the devil population to a percentage of the available food sources
  let devilLimit = (pademelons + bandicoots) * 0.5;
  if (devils > devilLimit) {
    devils = devilLimit;
  }

  // Cap the bandicoot population to a percentage of the grass population
  let bandicootLimit = grass * 0.12; // Adjust this for bandicoot ratio to grass
  if (bandicoots > bandicootLimit) {
    bandicoots = bandicootLimit;
  }
  if (bandicoots < devils * 0.5) {
    bandicoots = devils * 0.5;
  }

  // Constrain Populations
  if (grassLimitEnabled) {
    grass = constrain(grass, 0, 1000);
  } else {
    grass = max(grass, 0);
  }
  pademelons = max(pademelons, 0);
  devils = max(devils, 0);
  bandicoots = max(bandicoots, 0);

  // Visualise Ecosystem
  fill("green");
  ellipse(200, height / 2, grass);
  fill("orange");
  ellipse(400, height / 2, pademelons);
  fill("red");
  ellipse(600, height / 2, devils);
  fill("yellow");
  ellipse(800, height / 2, bandicoots);

  // Update Graph
  chart.data.labels.push(frameCount);
  chart.data.datasets[0].data.push(grass);
  chart.data.datasets[1].data.push(pademelons);
  chart.data.datasets[2].data.push(devils);
  chart.data.datasets[3].data.push(bandicoots);
  chart.update();

  // Keep Graph Length Manageable
  if (frameCount > 100) {
    chart.data.labels.shift();
    chart.data.datasets.forEach(dataset => dataset.data.shift());
  }

  function triggerNarrativeEvent() {
    if (currentRainfall < 20) {
      showNarrativeMessage("A dry spell has reduced grass availability. Herbivores are struggling—can you balance the sliders to recover grass population?");
    } else if (invasiveSpecies > 15) {
      showNarrativeMessage("Invasive species are overwhelming native habitats. Adjust the sliders to control their spread!");
    } else if (grass < 100) {
      showNarrativeMessage("Grass levels are dangerously low. Can you restore balance to the ecosystem?");
    }
  }

  function showNarrativeMessage(message) {
    const narrativeElement = document.createElement("div");
    narrativeElement.className = "narrative-message";
    narrativeElement.innerText = message;
    document.body.appendChild(narrativeElement);

    // Automatically fade out the message after 5 seconds
    setTimeout(() => {
      narrativeElement.style.opacity = "0";
      setTimeout(() => narrativeElement.remove(), 1000);
    }, 5000);
  }

  // Call this function periodically in the draw loop
  if (frameCount % 500 === 0) { // Every 500 frames
    triggerNarrativeEvent();
  }

  // Natural Disasters
  if (frameCount % 1000 === 0 && showDisasters) {
    triggerRandomEvent();
  }

  // Hide disaster message after a certain duration
  if (frameCount - disasterFrame > disasterDuration) {
    document.getElementById("disasterMessage").style.display = "none";
  }

  // Track population history
  pademelonsHistory.push(pademelons);
  devilsHistory.push(devils);
  bandicootsHistory.push(bandicoots);

  if (pademelonsHistory.length > historyLength) {
    pademelonsHistory.shift();
    devilsHistory.shift();
    bandicootsHistory.shift();
  }

  checkEcosystemStability(); // Check for ecosystem stability
  updatePoints(); // Call updatePoints within the draw function
  updatePointsDisplay(); // Update points display
  checkAchievements(); // Check for achievements

  // Debugging statements
  console.log(`Frame: ${frameCount}, Grass: ${grass}, Pademelons: ${pademelons}, Devils: ${devils}, Bandicoots: ${bandicoots}`);
}

function resetSim() {
  grass = 100;
  pademelons = 50;
  devils = 10;
  bandicoots = 30;
  chart.data.labels = [];
  chart.data.datasets.forEach(dataset => dataset.data = []);
  chart.update();
  frameCount = 0; // Reset frame count to restart the graph
  points = 0; // Reset points
  objectives.forEach(objective => objective.achieved = false); // Reset objectives
  pademelonsHistory = [];
  devilsHistory = [];
  bandicootsHistory = [];
  rangerBadgeAchieved = false; // Reset Ranger Badge achievement
  rangerBadgeMessageShown = false; // Reset message flag
  document.getElementById("rangerBadge").style.display = "none"; // Hide the badge
  document.getElementById("medalIcon").style.display = "none"; // Hide the medal icon
  updatePointsDisplay(); // Update points display
  updateObjectiveDisplay(); // Update objective display

  // Reset slider values
  document.getElementById("rainfall").value = 55; // Adjust this value to set the initial rainfall
  document.getElementById("rainfallValue").innerText = 55; // Update the displayed value

  document.getElementById("temperature").value = 25;
  document.getElementById("temperatureValue").innerText = 25;

  document.getElementById("invasiveSpecies").value = 5;
  document.getElementById("invasiveSpeciesValue").innerText = 5;

  document.getElementById("humanImpact").value = 2;
  document.getElementById("humanImpactValue").innerText = 2;

  // Reset interpolated values
  targetRainfall = currentRainfall = 50;
  targetTemperature = currentTemperature = 25;

  console.log("Simulation reset");
}

function updateValue(id) {
  document.getElementById(id + 'Value').innerText = document.getElementById(id).value;
}

function exportCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Time,Grass,Pademelons,Devils,Bandicoots\n";
  chart.data.labels.forEach((label, index) => {
    let row = `${label},${chart.data.datasets[0].data[index]},${chart.data.datasets[1].data[index]},${chart.data.datasets[2].data[index]},${chart.data.datasets[3].data[index]}\n`;
    csvContent += row;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const textNode = document.createTextNode("Download CSV");
  link.appendChild(textNode);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function toggleSeasonsDisplay() {
  showSeasons = document.getElementById("toggleSeasons").checked;
}

function toggleDisasters() {
  showDisasters = document.getElementById("toggleDisasters").checked;
}

function togglePause() {
  isPaused = !isPaused;
  document.getElementById("pauseButton").innerText = isPaused ? "Resume" : "Pause";
}

// Add event listener for keydown event
document.addEventListener('keydown', function(event) {
  if (event.code === 'Space') {
    event.preventDefault(); // Prevent the default action (scrolling)
    togglePause();
  }
});

function toggleGrassLimit() {
  grassLimitEnabled = !grassLimitEnabled;
  document.getElementById("toggleGrassLimitButton").innerText = grassLimitEnabled ? "Disable Grass Limit" : "Enable Grass Limit";
}

// Update Points and Objective Display
function updatePoints() {
  if (isPaused) {
    return; // Do not update points if the game is paused
  }

  console.log(`Checking objectives: Grass: ${grass}, Pademelons: ${pademelons}, Devils: ${devils}, Bandicoots: ${bandicoots}`);

  objectives.forEach(objective => {
    if ((objective.description === "Increase pademelon population to 200" && pademelons >= objective.target) ||
        (objective.description === "Increase pademelon population to 250" && pademelons >= objective.target) ||
        (objective.description === "Increase devil population to 80" && devils >= objective.target) ||
        (objective.description === "Increase grass population to 900" && grass >= objective.target) ||
        (objective.description === "Survive 8 natural disasters" && objective.count >= objective.target) ||
        (objective.description === "Maintain a stable ecosystem for 4000 frames" && frameCount >= objective.target) ||
        (objective.description === "Increase bandicoot population to 130" && bandicoots >= objective.target)) {
      if (!objective.achieved) {
        console.log(`Objective Achieved: ${objective.description}`);
        points += objective.points;
        objective.achieved = true;
        alert(`Objective Achieved: ${objective.description}\nPoints Awarded: ${objective.points}`);
        updateObjectiveDisplay(); // Update objective display after achieving an objective
      }
    }
  });

ongoingObjectives.forEach(objective => {
  if (objective.type === "grass" && grass > 700) {
    if (!objective.achieved) {
      objective.target--;
      if (objective.target <= 0) {
        points += objective.points;
        objective.achieved = true;
        alert(`Ongoing Objective Achieved: ${objective.description}\nPoints Awarded: ${objective.points}`);
        updateObjectiveDisplay(); // Update objective display after achieving an ongoing objective
      }
    }
  } else if (objective.type === "pademelons" && pademelons > 220) {
    if (!objective.achieved) {
      objective.target--;
      if (objective.target <= 0) {
        points += objective.points;
        objective.achieved = true;
        alert(`Ongoing Objective Achieved: ${objective.description}\nPoints Awarded: ${objective.points}`);
        updateObjectiveDisplay(); // Update objective display after achieving an ongoing objective
      }
    }
  } else if (objective.type === "devils" && devils > 70) {
    if (!objective.achieved) {
      objective.target--;
      if (objective.target <= 0) {
        points += objective.points;
        objective.achieved = true;
        alert(`Ongoing Objective Achieved: ${objective.description}\nPoints Awarded: ${objective.points}`);
        updateObjectiveDisplay(); // Update objective display after achieving an ongoing objective
      }
    }
  } else if (objective.type === "bandicoots" && bandicoots > 90) {
    if (!objective.achieved) {
      objective.target--;
      if (objective.target <= 0) {
        points += objective.points;
        objective.achieved = true;
        alert(`Ongoing Objective Achieved: ${objective.description}\nPoints Awarded: ${objective.points}`);
        updateObjectiveDisplay(); // Update objective display after achieving an ongoing objective
      }
    }
  } else if (objective.type === "balanced" && grass > 500 && pademelons > 100 && devils > 50 && bandicoots > 100) {
    if (!objective.achieved) {
      objective.target--;
      if (objective.target <= 0) {
        points += objective.points;
        objective.achieved = true;
        alert(`Ongoing Objective Achieved: ${objective.description}\nPoints Awarded: ${objective.points}`);
        updateObjectiveDisplay(); // Update objective display after achieving an ongoing objective
      }
    }
  } else {
    // Reset the target if the condition is not met
    objective.target = 800; // Reset to the original target value
  }
});

  if (points >= rangerBadgePoints && !rangerBadgeAchieved) {
    alert("Congratulations! You've earned the Ranger Badge!");
    document.getElementById("rangerBadge").style.display = "block"; // Display the badge
    rangerBadgeAchieved = true; // Set the badge as achieved
  } else if (points >= 500 && !rangerBadgeAchieved && !rangerBadgeMessageShown) {
    alert("Great job! You're on your way to earning the Ranger Badge. Keep the ecosystem stable to achieve it!");
    rangerBadgeMessageShown = true; // Prevent repeated messages
  }
}

function updatePointsDisplay() {
  document.getElementById("pointsDisplay").innerText = points;
  updateObjectiveDisplay(); // Update objective display
}

function checkEcosystemStability() {
  if (pademelonsHistory.length >= historyLength) {
    const avgPademelons = pademelonsHistory.reduce((a, b) => a + b, 0) / pademelonsHistory.length;
    const avgDevils = devilsHistory.reduce((a, b) => a + b, 0) / devilsHistory.length;
    const avgBandicoots = bandicootsHistory.reduce((a, b) => a + b, 0) / bandicootsHistory.length;

    if (Math.abs(avgPademelons - 50) < 10 && Math.abs(avgDevils - 10) < 5 && Math.abs(avgBandicoots - 30) < 10) {
      points += stabilityPoints;
      alert(`Ecosystem Stability Achieved!\nPoints Awarded: ${stabilityPoints}`);
      pademelonsHistory = [];
      devilsHistory = [];
      bandicootsHistory = [];
    }
  }

  let stabilityAchievement = achievements.find(ach => ach.description === "Maintain a stable ecosystem for 5000 frames");
  if (stabilityAchievement && !stabilityAchievement.achieved) {
    if (frameCount >= stabilityAchievement.target) {
      stabilityAchievement.achieved = true;
      points += stabilityAchievement.points; // Add points
      alert(`Achievement Unlocked: ${stabilityAchievement.description}\nPoints Awarded: ${stabilityAchievement.points}`);
      updatePointsDisplay(); // Update points display
      document.getElementById("achievementMessage").innerText = `Achievement Unlocked: ${stabilityAchievement.description}`;
      document.getElementById("achievementMessage").style.display = "block";
      setTimeout(() => {
        document.getElementById("achievementMessage").style.display = "none";
      }, 3000);
    }
  }

  let masterEcologistAchievement = newAchievements.find(ach => ach.description === "Master Ecologist: Maintain a stable ecosystem for 10,000 frames");
  if (masterEcologistAchievement && !masterEcologistAchievement.achieved) {
    if (frameCount >= masterEcologistAchievement.target) {
      masterEcologistAchievement.achieved = true;
      points += masterEcologistAchievement.points; // Add points
      alert(`Achievement Unlocked: ${masterEcologistAchievement.description}\nPoints Awarded: ${masterEcologistAchievement.points}`);
      updatePointsDisplay(); // Update points display
      displayAchievement(masterEcologistAchievement.description); // Display achievement
    }
  }
}

// Random Events
function triggerRandomEvent() {
  const events = ["bushfire", "flood", "disease outbreak"];
  const event = events[Math.floor(Math.random() * events.length)];
  handleEvent(event);
}

function handleEvent(event) {
  let disasterMessage = "";
  if (event === "bushfire") {
    grass -= 50;
    pademelons -= 20;
    devils -= 5;
    bandicoots -= 10;
    disasterMessage = "Bushfire Occurred!";
    background(255, 100, 100); // Red background for bushfire
  } else if (event === "flood") {
    pademelons -= 10;
    bandicoots -= 5;
    disasterMessage = "Flood Occurred!";
    background(100, 100, 255); // Blue background for flood
  } else if (event === "disease outbreak") {
    devils -= 10;
    bandicoots -= 10;
    disasterMessage = "Disease Outbreak Occurred!";
    background(150, 0, 150); // Purple background for disease outbreak
  }
  document.getElementById("disasterMessage").innerText = disasterMessage;
  document.getElementById("disasterMessage").style.display = "block";
  disasterFrame = frameCount;

  // Update objective for surviving 8 natural disasters
  let disasterObjective = objectives.find(obj => obj.description === "Survive 8 natural disasters");
  if (disasterObjective) {
    disasterObjective.count++;
    if (disasterObjective.count >= disasterObjective.target && !disasterObjective.achieved) {
      disasterObjective.achieved = true;
      points += disasterObjective.points; // Add points
      alert(`Objective Achieved: ${disasterObjective.description}\nPoints Awarded: ${disasterObjective.points}`);
      updatePointsDisplay(); // Update points display
      updateObjectiveDisplay(); // Update objective display
    }
  }

  // Update achievement for surviving 20 natural disasters
  let disasterAchievement = newAchievements.find(ach => ach.description === "Disaster Resilience: Survive 20 natural disasters");
  if (disasterAchievement) {
    disasterAchievement.count++;
    if (disasterAchievement.count >= disasterAchievement.target && !disasterAchievement.achieved) {
      disasterAchievement.achieved = true;
      points += disasterAchievement.points; // Add points
      alert(`Achievement Unlocked: ${disasterAchievement.description}\nPoints Awarded: ${disasterAchievement.points}`);
      updatePointsDisplay(); // Update points display
      displayAchievement(disasterAchievement.description); // Display achievement
    }
  }
}

function checkAchievements() {
  let stabilityAchievement = achievements.find(ach => ach.description === "Maintain a stable ecosystem for 5000 frames");
  if (stabilityAchievement && !stabilityAchievement.achieved) {
    if (frameCount >= stabilityAchievement.target) {
      stabilityAchievement.achieved = true;
      points += stabilityAchievement.points; // Add points
      alert(`Achievement Unlocked: ${stabilityAchievement.description}\nPoints Awarded: ${stabilityAchievement.points}`);
      updatePointsDisplay(); // Update points display
      document.getElementById("achievementMessage").innerText = `Achievement Unlocked: ${stabilityAchievement.description}`;
      document.getElementById("achievementMessage").style.display = "block";
      setTimeout(() => {
        document.getElementById("achievementMessage").style.display = "none";
      }, 3000);
    }
  }

  // Define disasterAchievement for checking Disaster Resilience achievement
  let disasterAchievement = achievements.find(ach => ach.description === "Survive 10 natural disasters");

  // Check for other new achievements
  newAchievements.forEach(achievement => {
    if (!achievement.achieved) {
      if (achievement.description === "Ecosystem Guardian: Achieve all ongoing objectives" && ongoingObjectives.every(obj => obj.achieved)) {
        achievement.achieved = true;
        points += achievement.points;
        alert(`Achievement Unlocked: ${achievement.description}\nPoints Awarded: ${achievement.points}`);
        displayAchievement(achievement.description);
      } else if (achievement.description === "Disaster Resilience: Survive 20 natural disasters" && disasterAchievement.count >= achievement.target) {
        achievement.achieved = true;
        points += achievement.points;
        alert(`Achievement Unlocked: ${achievement.description}\nPoints Awarded: ${achievement.points}`);
        displayAchievement(achievement.description);
      } else if (achievement.description === "Master Ecologist: Maintain a stable ecosystem for 10,000 frames" && frameCount >= achievement.target) {
        achievement.achieved = true;
        points += achievement.points;
        alert(`Achievement Unlocked: ${achievement.description}\nPoints Awarded: ${achievement.points}`);
        displayAchievement(achievement.description);
      } else if (achievement.description === "Population Expert: Achieve grass population of 1500, pademelon population of 350, devil population of 150, and bandicoot population of 200" && grass >= 1500 && pademelons >= 350 && devils >= 150 && bandicoots >= 200) {
        achievement.achieved = true;
        points += achievement.points;
        alert(`Achievement Unlocked: ${achievement.description}\nPoints Awarded: ${achievement.points}`);
        displayAchievement(achievement.description);
      }
    }
  });
}

function displayAchievement(description) {
  console.log(`Displaying achievement: ${description}`);
  const achievementElement = document.createElement("div");
  achievementElement.innerText = description;
  document.getElementById("achievementsContainer").appendChild(achievementElement);
}

// Collapsible Sections
document.querySelectorAll(".collapsible").forEach(button => {
  button.addEventListener("click", function() {
    this.classList.toggle("active");
    let content = this.nextElementSibling;
    let arrow = this.querySelector(".arrow");
    arrow.classList.toggle("active");
    if (content.style.display === "block") {
      content.style.display = "none";
      this.setAttribute("aria-expanded", "false");
    } else {
      content.style.display = "block";
      this.setAttribute("aria-expanded", "true");
    }
  });
});

function showAnswer(id) {
  document.getElementById(id).style.display = 'block';
}
