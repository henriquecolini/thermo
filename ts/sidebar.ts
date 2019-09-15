const sidebar = document.getElementById("sidebar");
const btnOpen = document.getElementById("btnOpen");
const btnClose = document.getElementById("btnClose");

btnOpen.addEventListener("click", () => {
	sidebar.classList.add("open");
});

btnClose.addEventListener("click", () => {
	sidebar.classList.remove("open");
});