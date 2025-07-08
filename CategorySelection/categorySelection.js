// Called when the Next button is clicked
function nextButtonClicked() {
    // Validate that all dropdowns are selected here
    window.location.href = "../PlayerSelection/playerSelection.html";
  }
  
  // Fetch categories from endpoint and populate select dropdown
  async function populateDropdown(endpoint, elementId) {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
  
      const select = document.getElementById(elementId);
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id; // category ID
        option.textContent = item.name; // category name
        select.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  }
  
  // Initialize all dropdowns
  populateDropdown('/api/top-left', 'category-one');
  populateDropdown('/api/top-right', 'category-two');
  populateDropdown('/api/bottom-left', 'category-three');
  populateDropdown('/api/bottom-right', 'category-four');
  