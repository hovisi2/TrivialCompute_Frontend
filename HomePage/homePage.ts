function startGame(): void {
  window.location.href = "../CategorySelection/categorySelection.html";
}

function editQuestions(): void {
  const password: string | null = prompt("Enter password to edit questions:");
  
  if (password === "trivia123") {
    window.location.href = "../QuestionEditorSelection/questionEditorSelection.html";
  } else {
    alert("Incorrect password. Access denied.");
  }
}
