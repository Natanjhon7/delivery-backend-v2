const Order = require("../models/Order");

module.exports = {
  // Criar pedido
  async create(req, res) {
    try {
      const order = await Order.create(req.body);
      return res.status(201).json(order);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Listar todos os pedidos
  async findAll(req, res) {
    try {
      const orders = await Order.find()
        .populate("user")
        .populate("items.product");
      return res.json(orders);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Buscar 1 pedido por ID
  async findOne(req, res) {
    try {
      const order = await Order.findById(req.params.id)
        .populate("user")
        .populate("items.product");

      if (!order) return res.status(404).json({ error: "Order not found" });

      return res.json(order);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Atualizar pedido
  async update(req, res) {
    try {
      const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      if (!order) return res.status(404).json({ error: "Order not found" });

      return res.json(order);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Alterar apenas status do pedido
  async updateStatus(req, res) {
    try {
      const { status } = req.body;

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!order) return res.status(404).json({ error: "Order not found" });

      return res.json(order);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Deletar pedido
  async delete(req, res) {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) return res.status(404).json({ error: "Order not found" });

      return res.json({ message: "Order deleted" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};
