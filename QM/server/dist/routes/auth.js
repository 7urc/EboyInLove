"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Routes d'authentification
router.post('/login', (req, res) => {
    // TODO: Implémenter la logique de connexion
    res.json({ message: 'Login endpoint' });
});
router.post('/register', (req, res) => {
    // TODO: Implémenter la logique d'inscription
    res.json({ message: 'Register endpoint' });
});
router.post('/logout', (req, res) => {
    // TODO: Implémenter la logique de déconnexion
    res.json({ message: 'Logout endpoint' });
});
exports.default = router;
//# sourceMappingURL=auth.js.map