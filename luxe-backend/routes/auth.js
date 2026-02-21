// LOGIN CON VALIDACIÓN COMPLETA
router.post('/login', async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        // 1. Buscar usuario por correo
        const usuario = await User.findOne({ correo });
        
        // 2. VALIDACIÓN 1: ¿Existe el correo?
        if (!usuario) {
            return res.status(401).json({ 
                error: '❌ Correo no registrado. Verifica o regístrate.' 
            });
        }

        // 3. VALIDACIÓN 2: Comparar contraseñas (usando bcrypt)
        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
        
        if (!contraseñaValida) {
            return res.status(401).json({ 
                error: '❌ Contraseña incorrecta. Intenta de nuevo.' 
            });
        }

        // 4. TODO BIEN: Generar token
        const token = jwt.sign(
            { id: usuario._id, role: usuario.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 5. Respuesta exitosa
        res.json({
            token,
            user: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                role: usuario.role
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
