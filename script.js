// Helper function to create a new container form
function createContainerForm() {
    const containerList = document.getElementById('containers-list');
  
    const containerDiv = document.createElement('div');
    containerDiv.classList.add('container-item');
    
    // Service Name
    const serviceNameDiv = document.createElement('div');
    serviceNameDiv.classList.add('form-group');
    serviceNameDiv.innerHTML = `
      <label for="service-name">Service Name:</label>
      <input type="text" class="service-name" placeholder="Enter service name">
    `;
    
    // Select Image
    const imageDiv = document.createElement('div');
    imageDiv.classList.add('form-group');
    imageDiv.innerHTML = `
      <label for="image">Select Image:</label>
      <select class="image">
        <option value="nginx:latest">Nginx</option>
        <option value="mysql:latest">MySQL</option>
        <option value="redis:latest">Redis</option>
        <option value="node:latest">Node.js</option>
        <option value="python:latest">Python</option>
        <option value="alpine:latest">Alpine</option>
      </select>
    `;
    
    // Port Configuration
    const portDiv = document.createElement('div');
    portDiv.classList.add('form-group');
    portDiv.innerHTML = `
      <label for="port">Port Mapping:</label>
      <input type="number" class="port" placeholder="Enter container port">
      <input type="number" class="host-port" placeholder="Enter host port">
    `;
    
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
      <label for="env-vars">Environment Variables:</label>
      <button type="button" class="add-env-var">Add Variable</button>
      <div class="env-vars-container"></div>
    `;
    
    // Command Override
    const commandDiv = document.createElement('div');
    commandDiv.classList.add('form-group');
    commandDiv.innerHTML = `
      <label for="command">Override Command:</label>
      <input type="text" class="command" placeholder="Optional: Enter command to override">
    `;
    
    // Remove Container Button
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove Container';
    removeButton.classList.add('remove-container');
    removeButton.addEventListener('click', () => containerDiv.remove());
  
    containerDiv.appendChild(serviceNameDiv);
    containerDiv.appendChild(imageDiv);
    containerDiv.appendChild(portDiv);
    containerDiv.appendChild(volumeDiv);
    containerDiv.appendChild(networkDiv);
    containerDiv.appendChild(envDiv);
    containerDiv.appendChild(commandDiv);
    containerDiv.appendChild(removeButton);
    
    containerList.appendChild(containerDiv);
    
    // Add event listeners to dynamically created elements
    volumeDiv.querySelector('.use-volume').addEventListener('change', function() {
      volumeDiv.querySelector('.volume-options').classList.toggle('hidden', !this.checked);
    });
    
    networkDiv.querySelector('.use-network').addEventListener('change', function() {
      networkDiv.querySelector('.network-options').classList.toggle('hidden', !this.checked);
    });
    
    const addEnvVarButton = containerDiv.querySelector('.add-env-var');
    addEnvVarButton.addEventListener('click', () => {
      const envVarsContainer = containerDiv.querySelector('.env-vars-container');
      const envVarDiv = document.createElement('div');
      envVarDiv.classList.add('env-var-input');
      envVarDiv.innerHTML = `
        <input type="text" placeholder="Enter environment variable key" class="env-key">
        <input type="text" placeholder="Enter environment variable value" class="env-value">
        <button type="button" class="remove-env-var">Remove</button>
      `;
      const removeEnvVarButton = envVarDiv.querySelector('.remove-env-var');
      removeEnvVarButton.addEventListener('click', () => envVarDiv.remove());
      envVarsContainer.appendChild(envVarDiv);
    });
  }
  
  // Add first container form when the page loads
  createContainerForm();
  
  // Add a new container form
  document.getElementById('add-container').addEventListener('click', createContainerForm);
  
  // Generate YAML when the button is clicked
  document.getElementById('generate-button').addEventListener('click', function() {
    const containers = document.querySelectorAll('.container-item');
    let yaml = `version: '3.8'\nservices:\n`;
  
    containers.forEach(container => {
      const serviceName = container.querySelector('.service-name').value;
      const image = container.querySelector('.image').value;
      const port = container.querySelector('.port').value;
      const hostPort = container.querySelector('.host-port').value;
      const useVolume = container.querySelector('.use-volume').checked;
      const volumeName = container.querySelector('.volume-name').value;
      const useNetwork = container.querySelector('.use-network').checked;
      const networkName = container.querySelector('.network-name').value;
      
      let containerYaml = `  ${serviceName}:\n`;
      containerYaml += `    image: ${image}\n`;
      if (port && hostPort) {
        containerYaml += `    ports:\n      - "${hostPort}:${port}"\n`;
      }
      if (useVolume) {
        containerYaml += `    volumes:\n      - ${volumeName}:/data\n`;
      }
      if (useNetwork) {
        containerYaml += `    networks:\n      - ${networkName}\n`;
      }
      
      const envVars = container.querySelectorAll('.env-var-input');
      if (envVars.length > 0) {
        containerYaml += `    environment:\n`;
        envVars.forEach(envVar => {
          const key = envVar.querySelector('.env-key').value;
          const value = envVar.querySelector('.env-value').value;
          if (key && value) {
            containerYaml += `      - ${key}=${value}\n`;
          }
        });
      }
      
      const command = container.querySelector('.command').value;
      if (command) {
        containerYaml += `    command: "${command}"\n`;
      }
      
      yaml += containerYaml;
    });
  
    yaml += `networks:\n  default:\n    external:\n      name: ${document.querySelector('.network-name').value || 'default'}\n`;
    document.getElementById('yaml-output').textContent = yaml;
  });
  