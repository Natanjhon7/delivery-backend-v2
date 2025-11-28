const User = require('../models/User');

// CREATE - Criar usuário
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, address } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: "Nome, email e senha são obrigatórios" 
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                error: "Usuário já existe com este email" 
            });
        }

        const user = new User({ name, email, password, address });
        await user.save();
        
        res.status(201).json({ 
            message: "Usuário criado com sucesso", 
            user 
        });
    } catch (error) {
        res.status(500).json({ 
            error: "Erro ao criar usuário: " + error.message 
        });
    }
};

// READ - Buscar todos usuários
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ 
            error: "Erro ao buscar usuários: " + error.message 
        });
    }
};

// READ - Buscar usuário por ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ 
                error: "Usuário não encontrado" 
            });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ 
            error: "Erro ao buscar usuário: " + error.message 
        });
    }
};

// UPDATE - Atualizar usuário
exports.updateUser = async (req, res) => {
    try {
        const { name, email, address } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, address },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ 
                error: "Usuário não encontrado" 
            });
        }

        res.json({ 
            message: "Usuário atualizado com sucesso", 
            user 
        });
    } catch (error) {
        res.status(500).json({ 
            error: "Erro ao atualizar usuário: " + error.message 
        });
    }
};

// DELETE - Deletar usuário
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ 
                error: "Usuário não encontrado" 
            });
        }

        res.json({ 
            message: "Usuário deletado com sucesso" 
        });
    } catch (error) {
        res.status(500).json({ 
            error: "Erro ao deletar usuário: " + error.message 
        });
    }
};