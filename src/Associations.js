import Buyers from "./models/buyers.js";
import Notification from "./models/notification.js";

export const initAssociations = () => {
  Buyers.hasMany(Notification, { foreignKey: "userId", onDelete: "CASCADE" });
  Notification.belongsTo(Buyers, { foreignKey: "userId" });
};
