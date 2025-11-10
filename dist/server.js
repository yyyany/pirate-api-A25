"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Server.ts
//École du WEB
//Programmation Web avancé
//©A2025
//
//Grandement inspiré du travail de William Levesque
//
// Configuration des paramètres dans le fichier .env
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Chargement des dépendances
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const auth_routes_1 = require("./routes/auth.routes");
const error_middleware_1 = require("./middleware/error.middleware");
const authLookup_middleware_1 = require("./middleware/authLookup.middleware");
const ship_routes_1 = require("./routes/ship.routes");
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
//Chemins vers les certificats SSL générés par Certbot
const sslOptions = {
    key: fs_1.default.readFileSync('/etc/letsencrypt/live/p.y-any.org/privkey.pem'),
    cert: fs_1.default.readFileSync('/etc/letsencrypt/live/p.y-any.org/fullchain.pem'),
};
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express_1.default.json());
// Configuration des routes
//if (process.env.NODE_ENV === "development") {
//  console.log("Swagger activé en mode développement");
//  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
//}
app.use("/swagger", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(yamljs_1.default.load(path_1.default.join(__dirname, "./swagger.yml"))));
app.get('/hello', (req, res) => {
    res.json({ message: 'Hello depuis Pirate API en HTTPS !' });
});
app.get("/api/ping", (req, res) => {
    console.log("Ping route hit"); // log pour vérifier que la route est atteinte
    res.status(200).send('pong');
});
app.use("/api/auth", authLookup_middleware_1.authLookup, (0, auth_routes_1.authRouter)());
app.use("/api/ships", (0, ship_routes_1.shipRouter)());
app.use("/api/ship", (0, ship_routes_1.receiveShipRouter)());
// Gestion des erreurs
app.use(error_middleware_1.errorHandler);
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
// Démarrer le serveur HTTPS p
https_1.default.createServer(sslOptions, app).listen(port, () => {
    console.log(`Listening on port ${port}`);
    console.log("Ping    on ./api/ping");
    if (process.env.NODE_ENV === "development") {
        console.log(`Swagger on ./swagger`);
    }
});
//# sourceMappingURL=server.js.map