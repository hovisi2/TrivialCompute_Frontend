 //Start Game Button is clicked
 async function startGameClicked() {
    window.location.href = '../GameBoard/gameBoard.html';

    // const playerData = {
    // playerOne: document.getElementById('player-one').value,
    // playerTwo: document.getElementById('player-two').value,
    // playerThree: document.getElementById('player-three').value,
    // playerFour: document.getElementById('player-four').value
    // };

    // try {
    // const response = await fetch('/api/save-players', {
    //     method: 'POST',
    //     headers: {
    //     'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(playerData)
    // });

    // if (response.ok) {
    //     window.location.href = 'GameBoard.html';
    // } else {
    //     alert('Failed to save players. Try again!');
    // }
    // } catch (error) {
    // console.error('Error saving players:', error);
    // alert('Something went wrong. Please try again.');
    // }
}

/*
//backend code to handle save text 
// Node.js + Express
app.post('/api/save-players', async (req, res) => {
 { playerOne, playerTwo, playerThree, playerFour } = req.body;

// TODO: Add validation or uniqueness checks

try {
    await db.query(
    'INSERT INTO players (name) VALUES (?), (?), (?), (?)',
    [playerOne, playerTwo, playerThree, playerFour]
    );
    res.status(200).send('Players saved successfully!');
} catch (err) {
    console.error(err);
    res.status(500).send('Database error');
}
});

//DB Code
CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

*/