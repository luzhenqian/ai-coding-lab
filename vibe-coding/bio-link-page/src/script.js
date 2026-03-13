function copyWechat() {
  var wechatId = "LZQ20130415";
  navigator.clipboard.writeText(wechatId).then(function () {
    showToast();
  });
}

function showToast() {
  var toast = document.getElementById("toast");
  toast.classList.add("show");
  setTimeout(function () {
    toast.classList.remove("show");
  }, 2000);
}

/* Card tilt effect on hover */
document.querySelectorAll(".link-card").forEach(function (card) {
  card.addEventListener("mousemove", function (e) {
    var rect = card.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var centerX = rect.width / 2;
    var centerY = rect.height / 2;
    var rotateX = (y - centerY) / centerY * -3;
    var rotateY = (x - centerX) / centerX * 3;
    card.style.transform = "translateY(-4px) perspective(600px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
  });

  card.addEventListener("mouseleave", function () {
    card.style.transform = "";
  });
});
