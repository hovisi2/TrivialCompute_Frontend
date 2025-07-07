function startGame() {
    window.location.href = "categorySelection.html";
  }
  
  function editQuestions() {
    const password = prompt("Enter password to edit questions:");
    if (password === "trivia123") {
      window.location.href = "questionEditorSelection.html";
    } else {
      alert("Incorrect password. Access denied.");
    }
  }
  