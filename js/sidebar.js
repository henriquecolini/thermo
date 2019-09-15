var sidebar = document.getElementById("sidebar");
var btnOpen = document.getElementById("btnOpen");
var btnClose = document.getElementById("btnClose");
btnOpen.addEventListener("click", function () {
    sidebar.classList.add("open");
});
btnClose.addEventListener("click", function () {
    sidebar.classList.remove("open");
});
//# sourceMappingURL=sidebar.js.map