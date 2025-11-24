import Navbar from "../../components/Navbar/Navbar.jsx";
import { Send as SendIcon } from "lucide-react";
import "./Send.css";

export default function Send({
  currentUser,
  sendForm,
  setSendForm,
  handleSendMoney,
  error,
  success,
  handleLogout,
}) {
  return (
    <div className="send-page">
      <Navbar handleLogout={handleLogout} />

      <div className="send-container">
        <div className="send-card">

          <h2 className="send-title">Send Money</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-section">

            <div className="form-group">
              <label>Recipient Username</label>
              <input
                type="text"
                value={sendForm.recipient}
                onChange={(e) =>
                  setSendForm({ ...sendForm, recipient: e.target.value })
                }
                placeholder="Enter username"
              />
            </div>

            <div className="form-group">
              <label>Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={sendForm.amount}
                onChange={(e) =>
                  setSendForm({ ...sendForm, amount: e.target.value })
                }
                placeholder="0.00"
              />
              <p className="balance-text">
                Available balance: ${currentUser.balance.toFixed(2)}
              </p>
            </div>

            <div className="form-group">
              <label>Note (Optional)</label>
              <textarea
                rows="3"
                value={sendForm.note}
                onChange={(e) =>
                  setSendForm({ ...sendForm, note: e.target.value })
                }
                placeholder="Add a note..."
              ></textarea>
            </div>

            <button className="btn-primary" onClick={handleSendMoney}>
              <SendIcon className="icon-lg" />
              Send Money
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
