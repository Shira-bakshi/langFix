document.getElementById("fix").addEventListener("click", () => {
  const input = document.getElementById("input").value;
  const output = fixTheWord(input);
  document.getElementById("output").value = output;
  
  
});
