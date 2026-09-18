export type Database = {
  public: {
    Tables: {
      perfis: {
        Row: {
          id: string;
          nome: string;
          email: string;
          pontos: number;
          role: 'catequizando' | 'administrador';
          criado_em: string;
        };
        Insert: {
          id: string;
          nome: string;
          email: string;
          pontos?: number;
          role?: 'catequizando' | 'administrador';
          criado_em?: string;
        };
        Update: {
          nome?: string;
          pontos?: number;
        };
        Relationships: [];
      };
      temas: {
        Row: {
          id: string;
          nome: string;
          cor: string | null;
        };
        Insert: {
          id?: string;
          nome: string;
          cor?: string | null;
        };
        Update: {
          nome?: string;
          cor?: string | null;
        };
        Relationships: [];
      };
      encontros: {
        Row: {
          id: string;
          titulo: string;
          resumo: string;
          conteudo: string;
          tema_id: string | null;
          data_encontro: string;
          criado_em: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          resumo: string;
          conteudo: string;
          tema_id?: string | null;
          data_encontro: string;
          criado_em?: string;
        };
        Update: Partial<Database['public']['Tables']['encontros']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'encontros_tema_id_fkey';
            columns: ['tema_id'];
            referencedRelation: 'temas';
            referencedColumns: ['id'];
          },
        ];
      };
      versiculos: {
        Row: {
          id: string;
          referencia: string;
          texto: string;
          data_exibicao: string;
        };
        Insert: {
          id?: string;
          referencia: string;
          texto: string;
          data_exibicao: string;
        };
        Update: Partial<Database['public']['Tables']['versiculos']['Insert']>;
        Relationships: [];
      };
      fotos_galeria: {
        Row: {
          id: string;
          titulo: string;
          data_evento: string;
          url_imagem: string;
          criado_em: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          data_evento: string;
          url_imagem: string;
          criado_em?: string;
        };
        Update: Partial<Database['public']['Tables']['fotos_galeria']['Insert']>;
        Relationships: [];
      };
      questionarios: {
        Row: {
          id: string;
          titulo: string;
          encontro_id: string;
          pontos_totais: number;
          restrito: boolean;
          criado_em: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          encontro_id: string;
          pontos_totais?: number;
          restrito?: boolean;
          criado_em?: string;
        };
        Update: Partial<Database['public']['Tables']['questionarios']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'questionarios_encontro_id_fkey';
            columns: ['encontro_id'];
            referencedRelation: 'encontros';
            referencedColumns: ['id'];
          },
        ];
      };
      perguntas: {
        Row: {
          id: string;
          questionario_id: string;
          enunciado: string;
          ordem: number;
          opcoes: string[];
          resposta_correta: number;
        };
        Insert: {
          id?: string;
          questionario_id: string;
          enunciado: string;
          ordem?: number;
          opcoes: string[];
          resposta_correta: number;
        };
        Update: Partial<Database['public']['Tables']['perguntas']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'perguntas_questionario_id_fkey';
            columns: ['questionario_id'];
            referencedRelation: 'questionarios';
            referencedColumns: ['id'];
          },
        ];
      };
      respostas_usuario: {
        Row: {
          id: string;
          usuario_id: string;
          questionario_id: string;
          acertos: number;
          total_perguntas: number;
          pontos_ganhos: number;
          respondido_em: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          questionario_id: string;
          acertos: number;
          total_perguntas: number;
          pontos_ganhos: number;
          respondido_em?: string;
        };
        Update: Partial<Database['public']['Tables']['respostas_usuario']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'respostas_usuario_questionario_id_fkey';
            columns: ['questionario_id'];
            referencedRelation: 'questionarios';
            referencedColumns: ['id'];
          },
        ];
      };
      questionario_acesso: {
        Row: {
          questionario_id: string;
          usuario_id: string;
          criado_em: string;
        };
        Insert: {
          questionario_id: string;
          usuario_id: string;
          criado_em?: string;
        };
        Update: Partial<Database['public']['Tables']['questionario_acesso']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'questionario_acesso_questionario_id_fkey';
            columns: ['questionario_id'];
            referencedRelation: 'questionarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'questionario_acesso_usuario_id_fkey';
            columns: ['usuario_id'];
            referencedRelation: 'perfis';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      responder_questionario: {
        Args: {
          p_questionario_id: string;
          p_respostas: { pergunta_id: string; resposta: number }[];
        };
        Returns: {
          acertos: number;
          total_perguntas: number;
          pontos_ganhos: number;
        }[];
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      admin_listar_perguntas: {
        Args: { p_questionario_id: string };
        Returns: {
          id: string;
          questionario_id: string;
          enunciado: string;
          ordem: number;
          opcoes: string[];
          resposta_correta: number;
        }[];
      };
    };
  };
};

export type Perfil = Database['public']['Tables']['perfis']['Row'];
export type Tema = Database['public']['Tables']['temas']['Row'];
export type Encontro = Database['public']['Tables']['encontros']['Row'];
export type Versiculo = Database['public']['Tables']['versiculos']['Row'];
export type FotoGaleria = Database['public']['Tables']['fotos_galeria']['Row'];
export type Questionario = Database['public']['Tables']['questionarios']['Row'];
export type Pergunta = Database['public']['Tables']['perguntas']['Row'];
export type RespostaUsuario = Database['public']['Tables']['respostas_usuario']['Row'];
export type QuestionarioAcesso = Database['public']['Tables']['questionario_acesso']['Row'];

/** Pergunta como o cliente pode vê-la: sem o gabarito (`resposta_correta`),
 * que só existe no banco e é conferido no servidor via RPC. */
export type PerguntaSemGabarito = Omit<Pergunta, 'resposta_correta'>;
