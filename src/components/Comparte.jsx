import { useState } from 'react';
import { Send, Mail, Phone, User, MessageSquare, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const Comparte = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '', // email o teléfono
    razon: '',
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', null

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar estado cuando el usuario empiece a escribir
    if (status) setStatus(null);
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      return 'El nombre es requerido';
    }
    if (!formData.contacto.trim()) {
      return 'El email o teléfono es requerido';
    }
    if (!formData.razon.trim()) {
      return 'La razón para escribir es requerida';
    }
    if (!formData.mensaje.trim()) {
      return 'El mensaje es requerido';
    }
    
    // Validar formato de email si parece ser un email
    if (formData.contacto.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contacto)) {
        return 'El formato del email no es válido';
      }
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setStatus({ type: 'error', message: validationError });
      return;
    }

    setLoading(true);
    
    try {
      // Usar EmailJS para enviar el email
      // Necesitarás configurar EmailJS con tu cuenta
      const emailData = {
        to_email: 'adam.bourbahh.romero@gmail.com',
        from_name: formData.nombre,
        from_contact: formData.contacto,
        subject: `Contacto CPC UGR: ${formData.razon}`,
        message: `
Nombre: ${formData.nombre}
Contacto: ${formData.contacto}
Razón: ${formData.razon}

Mensaje:
${formData.mensaje}

---
Enviado desde la plataforma del Club de Programación UGR
Fecha: ${new Date().toLocaleString()}
        `.trim()
      };

      // Intentar enviar con EmailJS (si está configurado)
      if (window.emailjs) {
        await window.emailjs.send(
          'YOUR_SERVICE_ID', // Configurar en EmailJS
          'YOUR_TEMPLATE_ID', // Configurar en EmailJS
          emailData,
          'YOUR_PUBLIC_KEY' // Configurar en EmailJS
        );
        
        setStatus({ 
          type: 'success', 
          message: 'Mensaje enviado exitosamente. Te contactaremos pronto.' 
        });
        
        // Limpiar formulario
        setFormData({
          nombre: '',
          contacto: '',
          razon: '',
          mensaje: ''
        });
      } else {
        // Fallback: mostrar información para contacto manual
        const mailtoLink = `mailto:adam.bourbahh.romero@gmail.com?subject=${encodeURIComponent(`Contacto CPC UGR: ${formData.razon}`)}&body=${encodeURIComponent(emailData.message)}`;
        window.location.href = mailtoLink;
        
        setStatus({ 
          type: 'success', 
          message: 'Se ha abierto tu cliente de email. Si no se abre automáticamente, copia la información y envíala a adam.bourbahh.romero@gmail.com' 
        });
      }
      
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setStatus({ 
        type: 'error', 
        message: 'Error al enviar el mensaje. Por favor, intenta contactarnos directamente en adam.bourbahh.romero@gmail.com' 
      });
    } finally {
      setLoading(false);
    }
  };

  const razones = [
    'Consulta general',
    'Quiero unirme al club',
    'Propuesta de colaboración',
    'Reporte de error',
    'Sugerencia de mejora',
    'Ayuda con ejercicios',
    'Información sobre eventos',
    'Otro'
  ];

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-black dark:text-white mb-6">
          Comparte con Nosotros
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 font-light leading-relaxed max-w-3xl mx-auto">
          ¿Tienes una idea, sugerencia o simplemente quieres formar parte del Club de Programación UGR? 
          Nos encantaría escucharte. Comparte tus pensamientos y conectemos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Información de contacto */}
        <div className="space-y-8">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-8 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-2xl font-light text-black dark:text-white mb-6">
              Información de Contacto
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-warm-orange/20 dark:bg-warm-orange/10 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-warm-orange" />
                </div>
                <div>
                  <h3 className="font-medium text-black dark:text-white">Email</h3>
                  <p className="text-gray-600 dark:text-gray-400">adam.bourbahh.romero@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-warm-orange/20 dark:bg-warm-orange/10 p-3 rounded-lg">
                  <User className="h-6 w-6 text-warm-orange" />
                </div>
                <div>
                  <h3 className="font-medium text-black dark:text-white">Responsable</h3>
                  <p className="text-gray-600 dark:text-gray-400">Adam Bourbah Romero</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-warm-orange/20 dark:bg-warm-orange/10 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-warm-orange" />
                </div>
                <div>
                  <h3 className="font-medium text-black dark:text-white">Respuesta</h3>
                  <p className="text-gray-600 dark:text-gray-400">Normalmente en 24-48 horas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Razones para contactar */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-8 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-2xl font-light text-black dark:text-white mb-6">
              ¿Por qué contactarnos?
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-warm-orange rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-black dark:text-white">Únete al Club</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Información sobre cómo formar parte de nuestra comunidad</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-warm-orange rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-black dark:text-white">Colaboraciones</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Propuestas de proyectos, workshops o eventos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-warm-orange rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-black dark:text-white">Feedback</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Sugerencias para mejorar la plataforma</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-warm-orange rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-black dark:text-white">Ayuda</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Soporte con ejercicios o dudas técnicas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de contacto */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-8 border border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-2xl font-light text-black dark:text-white mb-6">
            Envíanos un Mensaje
          </h2>

          {/* Estado del envío */}
          {status && (
            <div className={`mb-6 p-4 rounded-lg border ${
              status.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center space-x-2">
                {status.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`text-sm ${
                  status.type === 'success' 
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {status.message}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange focus:border-transparent transition-all duration-200"
                placeholder="Tu nombre y apellidos"
                disabled={loading}
                required
              />
            </div>

            {/* Email o Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email o Teléfono *
              </label>
              <input
                type="text"
                name="contacto"
                value={formData.contacto}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange focus:border-transparent transition-all duration-200"
                placeholder="tu@email.com o +34 XXX XXX XXX"
                disabled={loading}
                required
              />
            </div>

            {/* Razón */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Razón para escribir *
              </label>
              <select
                name="razon"
                value={formData.razon}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange focus:border-transparent transition-all duration-200"
                disabled={loading}
                required
              >
                <option value="">Selecciona una razón</option>
                {razones.map(razon => (
                  <option key={razon} value={razon}>{razon}</option>
                ))}
              </select>
            </div>

            {/* Mensaje */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mensaje *
              </label>
              <textarea
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Cuéntanos en detalle tu consulta, propuesta o comentario..."
                disabled={loading}
                required
              />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Mínimo 10 caracteres, máximo 1000
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading || !formData.nombre || !formData.contacto || !formData.razon || !formData.mensaje}
              className="w-full flex items-center justify-center space-x-2 bg-warm-orange hover:bg-warm-red text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Enviar Mensaje</span>
                </>
              )}
            </button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Privacidad:</strong> Tu información solo será usada para responder a tu consulta. 
              No compartimos datos con terceros y respetamos tu privacidad.
            </p>
          </div>
        </div>
      </div>

      {/* Call to action adicional */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-warm-orange/10 to-warm-red/10 rounded-lg p-8 border border-warm-orange/20">
          <h2 className="text-2xl font-light text-black dark:text-white mb-4">
            ¿Prefieres otras formas de contacto?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            También puedes encontrarnos en redes sociales o visitarnos en la universidad
          </p>
          <div className="flex items-center justify-center space-x-6">
            <a 
              href="mailto:adam.bourbahh.romero@gmail.com"
              className="flex items-center space-x-2 text-warm-orange hover:text-warm-red transition-colors"
            >
              <Mail className="h-5 w-5" />
              <span>Email directo</span>
            </a>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="text-gray-600 dark:text-gray-400">Universidad de Granada</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Comparte; 