// export default function notificationSocket(io, socket) {
//   const { userId } = socket.handshake.query;

//   if (userId) {
//     socket.join(String(userId)); // cada usuario tiene su "sala"
//     console.log(`🔔 Usuario ${userId} suscrito a su canal de notificaciones`);
//   }
// }
