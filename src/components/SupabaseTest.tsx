'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function testSupabase() {
      try {
        const supabase = createClient();
        
        // Test 1: Verificar variables de entorno
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('Variables de entorno de Supabase no configuradas');
        }

        // Test 2: Verificar conexión a Supabase
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          throw new Error(`Error de autenticación: ${error.message}`);
        }

        // Test 3: Verificar acceso a auth.users
        const { data: userData } = await supabase.auth.getUser();
        
        setUser(userData.user);
        setStatus('success');
        setMessage(`✅ Conexión exitosa! Usuario: ${userData.user ? userData.user.email || 'Autenticado' : 'No autenticado'}`);
        
      } catch (error) {
        setStatus('error');
        setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        console.error('Error en test de Supabase:', error);
      }
    }

    testSupabase();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold mb-2">🧪 Test de Conexión Supabase</h3>
      
      <div className={`p-3 rounded ${
        status === 'loading' ? 'bg-blue-50 text-blue-700' :
        status === 'success' ? 'bg-green-50 text-green-700' :
        'bg-red-50 text-red-700'
      }`}>
        {status === 'loading' && '🔄 Verificando conexión...'}
        {status !== 'loading' && message}
      </div>

      <div className="mt-3 text-xs text-gray-600">
        <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'No configurada'}</p>
        <p><strong>ANON Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada ✓' : 'No configurada ❌'}</p>
      </div>

      {user && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
          <strong>Usuario actual:</strong>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 