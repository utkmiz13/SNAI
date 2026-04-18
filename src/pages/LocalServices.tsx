import { motion } from 'framer-motion';
import { Phone, MapPin, Star, Clock, Store } from 'lucide-react';

const SERVICES = [
  {
    category: '🏪 General Stores',
    items: [
      { id: 1, name: 'Piyush General Store', owner: '', block: '1st Floor, Block-45', type: 'General Store', phone: null, hours: '7 AM – 10 PM', rating: 4.5, reviews: 32, speciality: 'Grocery, dairy, FMCG', open: true },
      { id: 2, name: 'Mohan Sahu General Store', owner: 'Mohan Sahu', block: 'Ground Floor, Block-39', type: 'General Store', phone: null, hours: '6:30 AM – 9 PM', rating: 4.3, reviews: 28, speciality: 'Grocery, fresh vegetables, oil', open: true },
      { id: 3, name: 'Mishra Provisional Store', owner: 'Mishra Ji', block: 'Ground Floor, Block-20', type: 'Provisional Store', phone: null, hours: '7 AM – 9:30 PM', rating: 4.6, reviews: 41, speciality: 'Provisions, spices, household items', open: true },
    ]
  },
  {
    category: '🍕 Snacks & Fast Food',
    items: [
      { id: 4, name: 'Manohar Lal Snacks', owner: 'Manohar Lal', block: 'Manohar Chauraha, Block-6', type: 'Fast Food / Street Food', phone: '9044908000', hours: '10 AM – 10 PM', rating: 4.8, reviews: 67, speciality: 'Chaat, samosa, kachori, pav bhaji, lassi', open: true },
      { id: 5, name: 'Gudoo Gupta Fast Food', owner: 'Gudoo Gupta', block: 'Block-14', type: 'Street Food & Snacks', phone: '7398554566', hours: '11 AM – 11 PM', rating: 4.7, reviews: 53, speciality: 'Biryani, rolls, Chinese, snacks', open: true },
    ]
  },
  {
    category: '🔧 Home Services',
    items: [
      { id: 6, name: 'Suresh Electrician', owner: 'Suresh Kumar', block: 'Block-8 (Mobile)', type: 'Electrician', phone: '9123456789', hours: '8 AM – 8 PM', rating: 4.6, reviews: 38, speciality: 'Wiring, fans, switches, appliance repair', open: true },
      { id: 7, name: 'Ramesh Plumber', owner: 'Ramesh Singh', block: 'Near Gate-2', type: 'Plumber', phone: '9876543210', hours: '7 AM – 9 PM', rating: 4.4, reviews: 29, speciality: 'Pipe fitting, leakage, bathroom fixtures', open: true },
      { id: 8, name: 'Sharma Painter', owner: 'Vijay Sharma', block: 'Block-25 (Mobile)', type: 'Painter', phone: '9765432100', hours: '8 AM – 7 PM', rating: 4.2, reviews: 15, speciality: 'Wall painting, putty, waterproofing', open: false },
    ]
  },
  {
    category: '🏥 Medical & Health',
    items: [
      { id: 9, name: 'Dr. Sharma Clinic', owner: 'Dr. R.K. Sharma', block: 'Block-3, Ground Floor', type: 'General Physician', phone: '9988776655', hours: '9 AM – 9 PM', rating: 4.7, reviews: 89, speciality: 'General medicine, fever, BP, diabetes', open: true },
    ]
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
};

export function LocalServices() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Local Services</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">Shops, restaurants, and service providers in Sharda Nagar Vistar</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {SERVICES.map((section) => (
          <div key={section.category}>
            <h2 className="text-lg font-bold mb-4">{section.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {section.items.map(service => (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  className="card p-5 hover:shadow-lg transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold group-hover:text-[hsl(var(--primary))] transition-colors">{service.name}</h3>
                      {service.owner && <p className="text-sm text-[hsl(var(--muted-foreground))]">👤 {service.owner}</p>}
                    </div>
                    <span className={`badge text-xs ${service.open ? 'badge-green' : 'badge-red'}`}>
                      {service.open ? '🟢 Open' : '🔴 Closed'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm text-[hsl(var(--muted-foreground))] mb-3">
                    <p className="flex items-center gap-1.5">
                      <MapPin size={13} className="flex-shrink-0" />
                      {service.block}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock size={13} className="flex-shrink-0" />
                      {service.hours}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Store size={13} className="flex-shrink-0" />
                      {service.speciality}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(star => (
                        <Star
                          key={star}
                          size={13}
                          fill={star <= Math.floor(service.rating) ? '#f59e0b' : 'none'}
                          className={star <= Math.floor(service.rating) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold">{service.rating}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">({service.reviews} reviews)</span>
                  </div>

                  {/* Action */}
                  {service.phone && (
                    <a
                      href={`tel:${service.phone}`}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-xl text-sm font-semibold transition-all"
                    >
                      <Phone size={15} /> Call: {service.phone}
                    </a>
                  )}
                  {!service.phone && (
                    <div className="flex items-center justify-center gap-2 w-full py-2 bg-[hsl(var(--muted))]/50 rounded-xl text-sm text-[hsl(var(--muted-foreground))]">
                      <MapPin size={15} /> Visit in-person
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Emergency Numbers */}
      <div className="card p-6">
        <h2 className="section-title mb-4">📞 Important Colony Contacts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: 'Security Gate', number: '1800-XXX-0001', icon: '🔒' },
            { name: 'Water Supply Complaint', number: '1800-XXX-0002', icon: '💧' },
            { name: 'Electricity Emergency', number: '1800-XXX-0003', icon: '⚡' },
            { name: 'Colony Leader', number: 'Contact RWA', icon: '👑' },
            { name: 'Nearest Hospital', number: '9876500001', icon: '🏥' },
            { name: 'Local Police', number: '100', icon: '🚔' },
          ].map((contact, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-[hsl(var(--muted))]/50 rounded-xl">
              <span className="text-2xl">{contact.icon}</span>
              <div>
                <p className="text-sm font-medium">{contact.name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{contact.number}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
