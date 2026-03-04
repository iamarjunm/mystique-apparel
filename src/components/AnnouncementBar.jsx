'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { client } from '../../sanity';

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const query = `*[_type == "announcementBar" && active == true]|order(order asc){
          _id,
          text,
          code,
          codeColor
        }`;
        const data = await client.fetch(query);
        setAnnouncements(data.length > 0 ? data : getDefaultAnnouncements());
      } catch (error) {
        console.error('[ANNOUNCEMENT] Error fetching:', error);
        setAnnouncements(getDefaultAnnouncements());
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const getDefaultAnnouncements = () => [
    {
      _id: '1',
      text: 'Free Worldwide Shipping on Orders Over $200',
      code: 'VOID20',
      codeColor: 'text-red-600',
    },
    {
      _id: '2',
      text: 'Use Code',
      code: 'VOID20',
      codeColor: 'text-red-600',
    },
  ];

  if (loading) {
    return (
      <div className="bg-black text-white py-2.5 overflow-hidden flex relative z-50 border-b border-white/10">
        <div className="text-[9px] font-medium tracking-[0.25em] uppercase px-8">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white py-2.5 overflow-hidden flex relative z-50 border-b border-white/10">
      <motion.div
        className="flex whitespace-nowrap items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
      >
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center">
            {announcements.map((item, idx) => (
              <div key={`${i}-${idx}`} className="flex items-center">
                <span className="text-[9px] font-medium tracking-[0.25em] uppercase px-8 text-white/70">
                  {item.text}
                  {item.code && (
                    <>
                      {' '}
                      <span className="text-white font-bold">
                        {item.code}
                      </span>
                    </>
                  )}
                </span>
                <span className="w-0.5 h-0.5 bg-white/30" />
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
