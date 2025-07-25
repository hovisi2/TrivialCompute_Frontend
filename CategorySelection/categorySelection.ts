// Called when the Next button is clicked
function nextButtonClicked(): void {
  // Validate that all dropdowns are selected here
  window.location.href = "../PlayerSelection/playerSelection.html";
}

// Define the expected shape of category data
interface Category {
  id: string | number;
  name: string;
}

// Fetch categories from endpoint and populate select dropdown
async function populateDropdown(endpoint: string, elementId: string): Promise<void> {
  try {
    const response: Response = await fetch(endpoint);
    const data: Category[] = await response.json();

    const select = document.getElementById(elementId) as HTMLSelectElement | null;
    if (!select) {
      console.error(`Element with ID '${elementId}' not found.`);
      return;
    }

    data.forEach((item: Category) => {
      const option: HTMLOptionElement = document.createElement('option');
      option.value = String(item.id); // Ensure value is a string
      option.textContent = item.name;
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
