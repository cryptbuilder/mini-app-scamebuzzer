export function showCustomAlert(
  message: string,
  onConfirm: () => void,
  onCancel: () => void
) {
  if (document.getElementById("scambuzzer-upgrade-modal")) return;

  const modal = document.createElement("div");
  modal.id = "scambuzzer-upgrade-modal";
  modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
    `;

  const dialog = document.createElement("div");
  dialog.style.cssText = `
    background-color: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    width: 90%;
    text-align: center;
  `;

  const title = document.createElement("h2");
  title.textContent = "ScamBuzzer Alert";
  title.style.cssText = `
    color: #1F2937;
    font-size: 20px;
    margin-bottom: 16px;
    font-weight: 600;
  `;

  const messageEl = document.createElement("p");
  messageEl.textContent = message;
  messageEl.style.cssText = `
    color: #4B5563;
    font-size: 16px;
    margin-bottom: 24px;
    line-height: 1.5;
  `;

  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText = `
    display: flex;
    justify-content: center;
    gap: 12px;
  `;

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.style.cssText = `
    padding: 8px 16px;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    background-color: white;
    color: #4B5563;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  `;
  cancelButton.onmouseover = () => {
    cancelButton.style.backgroundColor = "#F3F4F6";
  };
  cancelButton.onmouseout = () => {
    cancelButton.style.backgroundColor = "white";
  };

  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Upgrade Now";
  confirmButton.style.cssText = `
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background-color: #10B981;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  `;
  confirmButton.onmouseover = () => {
    confirmButton.style.backgroundColor = "#059669";
  };
  confirmButton.onmouseout = () => {
    confirmButton.style.backgroundColor = "#10B981";
  };

  // Add click handlers
  cancelButton.addEventListener("click", () => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
      dialog.style.display = "none";
    }
  });

  confirmButton.addEventListener("click", () => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
    window.location.href = "https://scambuzzer.com#pricing";
  });

  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(confirmButton);
  dialog.appendChild(title);
  dialog.appendChild(messageEl);
  dialog.appendChild(buttonContainer);
  modal.appendChild(dialog);
  document.body.appendChild(modal);
}
