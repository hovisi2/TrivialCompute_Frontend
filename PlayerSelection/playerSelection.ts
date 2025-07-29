// Define the structure of player data
interface PlayerData {
    playerOne: string;
    playerTwo: string;
    playerThree: string;
    playerFour: string;
  }
  
  // Start Game Button is clicked
  async function startGameClicked(): Promise<void> {
    const playerData: PlayerData = {
      playerOne: (document.getElementById('player-one') as HTMLInputElement).value,
      playerTwo: (document.getElementById('player-two') as HTMLInputElement).value,
      playerThree: (document.getElementById('player-three') as HTMLInputElement).value,
      playerFour: (document.getElementById('player-four') as HTMLInputElement).value,
    };
  
    try {
      const response: Response = await fetch('/api/save-players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData),
      });
  
      if (response.ok) {
        window.location.href = '../GameBoard/gameBoard.html';
      } else {
        alert('Failed to save players. Try again!');
      }
    } catch (error: unknown) {
      console.error('Error saving players:', error);
      alert('Something went wrong. Please try again.');
    }
  } 
 