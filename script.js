// Select DOM Elements
const addContainerButton = document.getElementById('add-container');
const generateButton = document.getElementById('generate-button');
const containersList = document.getElementById('containers-list');
const yamlOutput = document.getElementById('yaml-output');

// Add Container Form
addContainerButton.addEventListener('click', () => {
  createContainerForm();
  // Scroll to newly added container
  setTimeout(() => {
    const newContainer = containersList.lastElementChild;
    newContainer.scrollIntoView({ behavior: 'smooth' });
  }, 100);
});

// Generate Docker Compose YAML
generateButton.addEventListener('click', generateDockerComposeYAML);

// Function to Create Container Form
function createContainerForm() {
  const containerDiv = document.createElement('div');
  containerDiv.classList.add('container-item');

  // Service Name
  const serviceNameDiv = createFormGroup('Service Name:', 'text', 'service-name', 'Enter service name');

  // Select Image
  const imageDiv = createFormGroup('Select Image:', 'select', 'image');
  const imageOptions = ['nginx:latest', 'mysql:latest', 'redis:latest', 'node:latest', 'python:latest', 'alpine:latest'];
  addOptionsToSelect(imageDiv.querySelector('select'), imageOptions);

  // Port Mapping
  const portDiv = createFormGroup('Port Mapping:', 'number', 'port', 'Enter container port');
  const hostPortDiv = createFormGroup('Host Port:', 'number', 'host-port', 'Enter host port');

  // Volume Configuration
  const volumeDiv = document.createElement('div');
  volumeDiv.classList.add('form-group');
  volumeDiv.innerHTML = `
    <label for="use-volume">Use Volume:</label>
    <input type="checkbox" class="use-volume">
    <div class="volume-options hidden">
      <label for="volume-name">Volume Name:</label>
      <input type="text" class="volume-name" placeholder="Enter volume name">
    </div>
  `;

  // Network Configuration
  const networkDiv = document.createElement('div');
  networkDiv.classList.add('form-group');
  networkDiv.innerHTML = `
    <label for="use-network">Use Network:</label>
    <input type="checkbox" class="use-network">
    <div class="network-options hidden">
      <label for="network-name">Network Name:</label>
      <input type="text" class="network-name" placeholder="Enter network name">
    </div>
  `;

  // Environment Variables
  const envDiv = document.createElement('div');
  envDiv.classList.add('form-group');
  envDiv.innerHTML = `
    <label>Environment Variables:</label>
    <div class="env-vars-container"></div>
    <button type="button" class="add-env-var">Add Environment Variable</button>
  `;
  envDiv.querySelector('.add-env-var').addEventListener('click', addEnvVarInput);

  // Resource Configuration
  const resourceDiv = document.createElement('div');
  resourceDiv.classList.add('form-group');
  resourceDiv.innerHTML = `
    <label for="use-resources">Configure Resources:</label>
    <input type="checkbox" class="use-resources">
    <div class="resource-options hidden">
      <label for="cpu">CPU (cores):</label>
      <input type="number" class="cpu" min="0" step="0.1" placeholder="Enter number of CPUs">
      <label for="memory">Memory (MB):</label>
      <input type="number" class="memory" min="0" placeholder="Enter memory in MB">
    </div>
  `;

  // Replicas Configuration
  const replicasDiv = createFormGroup('Replicas:', 'number', 'replicas', 'Enter number of replicas');

  // Command Override
  const commandDiv = createFormGroup('Override Command:', 'text', 'command', 'Enter command to override (optional)');

  // Remove Container Button
  const removeButton = document.createElement('button');
  removeButton.classList.add('remove-container');
  removeButton.textContent = 'Remove Container';
  removeButton.addEventListener('click', () => {
    containerDiv.classList.add('fade-out');
    setTimeout(() => containerDiv.remove(), 300);
  });

  containerDiv.appendChild(serviceNameDiv);
  containerDiv.appendChild(imageDiv);
  containerDiv.appendChild(portDiv);
  containerDiv.appendChild(hostPortDiv);
  containerDiv.appendChild(volumeDiv);
  containerDiv.appendChild(networkDiv);
  containerDiv.appendChild(envDiv);
  containerDiv.appendChild(resourceDiv);
  containerDiv.appendChild(replicasDiv);
  containerDiv.appendChild(commandDiv);
  containerDiv.appendChild(removeButton);

  containerDiv.classList.add('fade-in');
  containersList.appendChild(containerDiv);

  // Handle Volume and Network Toggle with animation
  const volumeCheckbox = containerDiv.querySelector('.use-volume');
  const volumeOptions = containerDiv.querySelector('.volume-options');
  volumeCheckbox.addEventListener('change', () => {
    toggleOptions(volumeOptions, volumeCheckbox.checked);
  });

  const networkCheckbox = containerDiv.querySelector('.use-network');
  const networkOptions = containerDiv.querySelector('.network-options');
  networkCheckbox.addEventListener('change', () => {
    toggleOptions(networkOptions, networkCheckbox.checked);
  });

  const resourcesCheckbox = containerDiv.querySelector('.use-resources');
  const resourceOptions = containerDiv.querySelector('.resource-options');
  resourcesCheckbox.addEventListener('change', () => {
    toggleOptions(resourceOptions, resourcesCheckbox.checked);
  });
}

function toggleOptions(element, show) {
  if (show) {
    element.classList.remove('hidden');
    element.classList.add('slide-down');
  } else {
    element.classList.add('slide-up');
    setTimeout(() => element.classList.add('hidden'), 300);
  }
}

// Helper Function to Create Form Groups
function createFormGroup(labelText, inputType, className, placeholderText = '') {
  const div = document.createElement('div');
  div.classList.add('form-group');
  div.innerHTML = `
    <label for="${className}">${labelText}</label>
    ${inputType === 'select' ? `<select class="${className}"></select>` : `<input type="${inputType}" class="${className}" placeholder="${placeholderText}">`}
  `;
  return div;
}

// Function to Add Options to Select Element
function addOptionsToSelect(selectElement, optionsArray) {
  optionsArray.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.textContent = option;
    selectElement.appendChild(optionElement);
  });
}

// Function to Add Environment Variable Inputs
function addEnvVarInput(event) {
  const containerDiv = event.target.closest('.container-item');
  const envVarsContainer = containerDiv.querySelector('.env-vars-container');

  const envVarDiv = document.createElement('div');
  envVarDiv.classList.add('env-var-input', 'fade-in');
  envVarDiv.innerHTML = `
    <input type="text" class="env-key" placeholder="Enter key">
    <input type="text" class="env-value" placeholder="Enter value">
    <button type="button" class="remove-env-var">Remove</button>
  `;

  envVarDiv.querySelector('.remove-env-var').addEventListener('click', () => {
    envVarDiv.classList.add('fade-out');
    setTimeout(() => envVarDiv.remove(), 300);
  });

  envVarsContainer.appendChild(envVarDiv);
}

// Function to Generate Docker Compose YAML
function generateDockerComposeYAML() {
  const containers = document.querySelectorAll('.container-item');
  const dockerCompose = {
    version: '3',
    services: {}
  };

  containers.forEach(container => {
    const serviceName = container.querySelector('.service-name').value;
    const image = container.querySelector('.image').value;
    const port = container.querySelector('.port').value;
    const hostPort = container.querySelector('.host-port').value;
    const useVolume = container.querySelector('.use-volume').checked;
    const volumeName = container.querySelector('.volume-name')?.value;
    const useNetwork = container.querySelector('.use-network').checked;
    const networkName = container.querySelector('.network-name')?.value;
    const useResources = container.querySelector('.use-resources').checked;
    const cpu = container.querySelector('.cpu')?.value;
    const memory = container.querySelector('.memory')?.value;
    const replicas = container.querySelector('.replicas')?.value;
    const command = container.querySelector('.command')?.value;
    const envVars = [];
    
    container.querySelectorAll('.env-var-input').forEach(envVar => {
      const key = envVar.querySelector('.env-key').value;
      const value = envVar.querySelector('.env-value').value;
      if (key && value) {
        envVars.push({ key, value });
      }
    });

    if (serviceName && image) {
      dockerCompose.services[serviceName] = {
        image,
        ...(port && hostPort && { ports: [`${hostPort}:${port}`] }),
        ...(useVolume && volumeName && { volumes: [`${volumeName}:/data`] }),
        ...(useNetwork && networkName && { networks: [networkName] }),
        ...(useResources && (cpu || memory) && {
          deploy: {
            resources: {
              limits: {
                ...(cpu && { cpus: cpu }),
                ...(memory && { memory: `${memory}M` })
              }
            },
            ...(replicas && { replicas: parseInt(replicas) })
          }
        }),
        ...(command && { command: command.split(' ') }),
        ...(envVars.length > 0 && {
          environment: envVars.reduce((envObj, { key, value }) => {
            envObj[key] = value;
            return envObj;
          }, {})
        })
      };
    }
  });

  yamlOutput.textContent = JSON.stringify(dockerCompose, null, 2);
  yamlOutput.classList.add('highlight');
  setTimeout(() => yamlOutput.classList.remove('highlight'), 500);
}
