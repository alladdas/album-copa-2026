-- ============================================================
-- seed_data.sql  —  Álbum Panini Copa do Mundo 2026 (980 figurinhas)
-- Função idempotente: cria a coleção completa para um usuário.
-- Rode DEPOIS do schema.sql. Chame: select seed_copa_2026(auth.uid());
-- (ou o app chama automaticamente no primeiro acesso)
-- ============================================================

create or replace function seed_copa_2026(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_collection_id uuid;
  v_team_id uuid;
begin
  -- Guard: só o próprio usuário pode criar o próprio álbum
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'unauthorized';
  end if;

  -- Evita duplicar: se o usuário já tem coleção Copa 2026, retorna a existente.
  select id into v_collection_id
    from collections
   where user_id = p_user_id and name = 'Copa 2026 — meu álbum'
   limit 1;
  if v_collection_id is not null then
    return v_collection_id;
  end if;

  insert into collections (user_id, name, total_stickers)
  values (p_user_id, 'Copa 2026 — meu álbum', 980)
  returning id into v_collection_id;

  -- México
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'México', 'MEX', 'team', 1)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Luis Malagón', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Johan Vásquez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Jorge Sánchez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'César Montes', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Jesús Gallardo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Israel Reyes', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Diego Lainez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Carlos Rodríguez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Edson Álvarez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Orbelín Pineda', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Marcel Ruiz', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Érick Sánchez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Hirving Lozano', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Santiago Giménez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Raúl Jiménez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Alexis Vega', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Roberto Alvarado', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'César Huerta', 'player', false);

  -- África do Sul
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'África do Sul', 'RSA', 'team', 2)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Ronwen Williams', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Sipho Chaine', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Aubrey Modiba', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Samukele Kabini', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Mbekezeli Mbokazi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Khulumani Ndamane', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Siyabonga Ngezana', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Khuliso Mudau', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Nkosinathi Sibisi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Teboho Mokoena', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Thalente Mbatha', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Bathasi Aubaas', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Yaya Sithole', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Sipho Mbule', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Lyle Foster', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Iqraam Rayners', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Mohau Nkota', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Oswin Appollis', 'player', false);

  -- Coreia do Sul
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Coreia do Sul', 'KOR', 'team', 3)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Jo Hyeon-woo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Kim Seung-Gyu', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Kim Min-jae', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Cho Yu-min', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Seol Young-woo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Lee Han-beom', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Lee Tae-seok', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Lee Myung-jae', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Lee Jae-sung', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Hwang In-beom', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Lee Kang-in', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Paik Seung-ho', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Jens Castrop', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Lee Dong-gyeong', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Cho Gue-sung', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Son Heung-min', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Hwang Hee-chan', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Oh Hyeon-Gyu', 'player', false);

  -- Tchéquia
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Tchéquia', 'CZE', 'team', 4)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Matěj Kovář', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Jindřich Staněk', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Ladislav Krejčí', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Vladimír Coufal', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Jaroslav Zelený', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Tomáš Holeš', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'David Zima', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Michal Sadílek', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Lukáš Provod', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Lukáš Červ', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Tomáš Souček', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Pavel Šulc', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Matěj Vydra', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Vasil Kušej', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Tomáš Chorý', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Václav Černý', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Adam Hložek', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Patrik Schick', 'player', false);

  -- Canadá
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Canadá', 'CAN', 'team', 5)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Dayne St.Clair', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Alphonso Davies', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Alistair Johnston', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Samuel Adekugbe', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Richie Laryea', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Derek Cornelius', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Moïse Bombito', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Kamal Miller', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Stephen Eustáquio', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Ismaël Koné', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Jonathan Osorio', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Jacob Shaffelburg', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Mathieu Choinière', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Niko Sigur', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Tajon Buchanan', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Liam Millar', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Cyle Larin', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Jonathan David', 'player', false);

  -- Bósnia e Herzegovina
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Bósnia e Herzegovina', 'BIH', 'team', 6)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Nikola Vasilj', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Amer Dedić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Sead Kolašinac', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Tarik Muharemović', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Nihad Mujakić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Nikola Katić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Amir Hadžiahmetović', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Benjamin Tahirović', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Armin Gigović', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Ivan Šunjić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Ivan Bašić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Dženis Burnić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Esmir Bajraktarević', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Amar Memić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Ermedin Demirović', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Edin Džeko', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Samed Baždar', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Haris Tabaković', 'player', false);

  -- Catar
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Catar', 'QAT', 'team', 7)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Meshaal Barsham', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Sultan Albrake', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Lucas Mendes', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Homam Ahmed', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Boualem Khoukhi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Pedro Miguel', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Tarek Salman', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Mohamed Al-Mannai', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Karim Boudiaf', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Assim Madibo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Ahmed Fatehi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Mohammed Waad', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Abdulaziz Hatem', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Hassan Al-Haydos', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Edmilson Junior', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Akram Afif', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Ahmed Al Ganehi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Almoez Ali', 'player', false);

  -- Suíça
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Suíça', 'SUI', 'team', 8)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Gregor Kobel', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Yvon Mvogo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Manuel Akanji', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Ricardo Rodríguez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Nico Elvedi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Aurèle Amenda', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Silvan Widmer', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Granit Xhaka', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Denis Zakaria', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Remo Freuler', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Fabian Rieder', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Ardon Jashari', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Johan Manzambi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Michel Aebischer', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Breel Embolo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Rubén Vargas', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Dan Ndoye', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Zeki Amdouni', 'player', false);

  -- Brasil
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Brasil', 'BRA', 'team', 9)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Alisson', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Bento', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Marquinhos', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Éder Militão', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Gabriel Magalhães', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Danilo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Wesley', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Lucas Paquetá', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Casemiro', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Bruno Guimarães', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Luiz Henrique', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Vinícius Júnior', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Rodrygo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'João Pedro', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Matheus Cunha', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Gabriel Martinelli', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Raphinha', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Estêvão', 'player', false);

  -- Marrocos
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Marrocos', 'MAR', 'team', 10)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Yassine Bounou', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Munir El Kajoui', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Achraf Hakimi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Noussair Mazraoui', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Nayef Aguerd', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Romain Saïss', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Jawad El Yamiq', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Adam Masina', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Sofyan Amrabat', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Azzedine Ounahi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Eliesse Ben Seghir', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Bilal El Khannouss', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Ismael Saibari', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Youssef En-Nesyri', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Abde Ezzalzouli', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Soufiane Rahimi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Brahim Díaz', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Ayoub El Kaabi', 'player', false);

  -- Haiti
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Haiti', 'HAI', 'team', 11)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Johny Placide', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Carlens Arcus', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Martin Experience', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Jean-Kévin Duverne', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Ricardo Adé', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Duke Lacroix', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Garven Metusala', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Hannes Delcroix', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Leverton Pierre', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Danley Jean Jacques', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Jean-Ricner Bellegarde', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Christopher Attys', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Derrick Etienne Jr', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Josué Casimir', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Ruben Providence', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Duckens Nazon', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Louicius Deedson', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Frantzdy Pierrot', 'player', false);

  -- Escócia
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Escócia', 'SCO', 'team', 12)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Angus Gunn', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Jack Hendry', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Kieran Tierney', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Aaron Hickey', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Andrew Robertson', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Scott McKenna', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'John Souttar', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Anthony Ralston', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Grant Hanley', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Scott McTominay', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Billy Gilmour', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Lewis Ferguson', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Ryan Christie', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Kenny McLean', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'John McGinn', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Lyndon Dykes', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Che Adams', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Ben Doak', 'player', false);

  -- Estados Unidos
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Estados Unidos', 'USA', 'team', 13)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Matt Freese', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Chris Richards', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Tim Ream', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Mark McKenzie', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Alex Freeman', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Antonee Robinson', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Tyler Adams', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Tanner Tessmann', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Weston McKennie', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Christian Roldan', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Timothy Weah', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Diego Luna', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Malik Tillman', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Christian Pulisic', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Brenden Aaronson', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Ricardo Pepi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Haji Wright', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Folarin Balogun', 'player', false);

  -- Paraguai
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Paraguai', 'PAR', 'team', 14)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Roberto Fernández', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Orlando Gill', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Gustavo Gómez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Fabián Balbuena', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Juan José Cáceres', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Omar Alderete', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Junior Alonso', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Mathías Villasanti', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Diego Gómez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Damián Bobadilla', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Andrés Cubas', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Matías Galarza Fonda', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Julio Enciso', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Alejandro Romero Gamarra', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Miguel Almirón', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Ramón Sosa', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Ángel Romero', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Antonio Sanabria', 'player', false);

  -- Austrália
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Austrália', 'AUS', 'team', 15)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Mathew Ryan', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Joe Gauci', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Harry Souttar', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Alessandro Circati', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Jordan Bos', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Aziz Behich', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Cameron Burgess', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Lewis Miller', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Miloš Degenek', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Jackson Irvine', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Riley McGree', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Aiden O''Neill', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Connor Metcalfe', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Patrick Yazbek', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Craig Goodwin', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Kusini Yengi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Nestory Irankunda', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Mohamed Touré', 'player', false);

  -- Turquia
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Turquia', 'TUR', 'team', 16)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Uğurcan Çakır', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Mert Müldür', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Zeki Çelik', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Abdülkerim Bardakcı', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Çağlar Söyüncü', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Merih Demiral', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Ferdi Kadıoğlu', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Kaan Ayhan', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'İsmail Yüksek', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Hakan Çalhanoğlu', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Orkun Kökçü', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Arda Güler', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'İrfan Can Kahveci', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Yunus Akgün', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Can Uzun', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Barış Alper Yılmaz', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Kerem Aktürkoğlu', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Kenan Yıldız', 'player', false);

  -- Alemanha
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Alemanha', 'GER', 'team', 17)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Marc-André ter Stegen', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Jonathan Tah', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'David Raum', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Nico Schlotterbeck', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Antonio Rüdiger', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Waldemar Anton', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Ridle Baku', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Maximilian Mittelstädt', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Joshua Kimmich', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Florian Wirtz', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Felix Nmecha', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Leon Goretzka', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Jamal Musiala', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Serge Gnabry', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Kai Havertz', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Leroy Sané', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Karim Adeyemi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Nick Woltemade', 'player', false);

  -- Curaçao
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Curaçao', 'CUW', 'team', 18)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Eloy Room', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Armando Obispo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Sherel Floranus', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Jurien Gaari', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Joshua Brenet', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Roshon van Eijma', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Shurandy Sambo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Livano Comenencia', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Godfried Roemeratoe', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Juninho Bacuna', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Leandro Bacuna', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Tahith Chong', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Kenji Gorré', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Jearl Margaritha', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Jürgen Locadia', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Jeremy Antonisse', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Gervane Kastaneer', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Sontje Hansen', 'player', false);

  -- Costa do Marfim
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Costa do Marfim', 'CIV', 'team', 19)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Yahia Fofana', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Ghislain Konan', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Wilfried Singo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Odilon Kossounou', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Evan Ndicka', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Willy Boly', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Emmanuel Agbadou', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Ousmane Diomandé', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Franck Kessié', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Seko Fofana', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Ibrahim Sangaré', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Jean-Philippe Gbamin', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Amad Diallo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Sébastien Haller', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Simon Adingra', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Yan Diomande', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Evann Guessand', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Oumar Diakité', 'player', false);

  -- Equador
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Equador', 'ECU', 'team', 20)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Hernán Galíndez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Gonzalo Valle', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Piero Hincapié', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Pervis Estupiñán', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Willian Pacho', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Ángelo Preciado', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Joel Ordóñez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Moisés Caicedo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Alan Franco', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Kendry Páez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Pedro Vite', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'John Yeboah', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Leonardo Campana', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Gonzalo Plata', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Nilson Angulo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Alan Minda', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Kevin Rodríguez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Enner Valencia', 'player', false);

  -- Holanda
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Holanda', 'NED', 'team', 21)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Bart Verbruggen', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Virgil van Dijk', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Micky van de Ven', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Jurriën Timber', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Denzel Dumfries', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Nathan Aké', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Jeremie Frimpong', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Jan Paul van Hecke', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Tijjani Reijnders', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Ryan Gravenberch', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Teun Koopmeiners', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Frenkie de Jong', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Xavi Simons', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Justin Kluivert', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Memphis Depay', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Donyell Malen', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Wout Weghorst', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Cody Gakpo', 'player', false);

  -- Japão
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Japão', 'JPN', 'team', 22)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Zion Suzuki', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Hiroki Mochizuki', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Ayumu Seko', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Junnosuke Suzuki', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Shogo Taniguchi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Tsuyoshi Watanabe', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Kaishu Sano', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Yuki Soma', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Ao Tanaka', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Daichi Kamada', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Takefusa Kubo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Ritsu Doan', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Keito Nakamura', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Takumi Minamino', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Shuto Machino', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Junya Ito', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Koki Ogawa', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Ayase Ueda', 'player', false);

  -- Suécia
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Suécia', 'SWE', 'team', 23)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Victor Johansson', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Isak Hien', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Gabriel Gudmundsson', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Emil Holm', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Victor Nilsson Lindelöf', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Gustaf Lagerbielke', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Lucas Bergvall', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Hugo Larsson', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Jesper Karlström', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Yasin Ayari', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Mattias Svanberg', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Daniel Svensson', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Ken Sema', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Roony Bardghji', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Dejan Kulusevski', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Anthony Elanga', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Alexander Isak', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Viktor Gyökeres', 'player', false);

  -- Tunísia
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Tunísia', 'TUN', 'team', 24)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Béchir Ben Saïd', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Aymen Dahmen', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Yan Valery', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Montassar Talbi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Yassine Meriah', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Ali Abdi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Dylan Bronn', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Ellyes Skhiri', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Aïssa Laïdouni', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Ferjani Sassi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Mohamed Ali Ben Romdhane', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Hannibal Mejbri', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Elias Achouri', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Elias Saad', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Hazem Mastouri', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Ismaël Gharbi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Sayfallah Ltaief', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Naïm Sliti', 'player', false);

  -- Bélgica
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Bélgica', 'BEL', 'team', 25)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Thibaut Courtois', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Arthur Theate', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Timothy Castagne', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Zeno Debast', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Brandon Mechele', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Maxim De Cuyper', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Thomas Meunier', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Youri Tielemans', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Amadou Onana', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Nicolas Raskin', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Alexis Saelemaekers', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Hans Vanaken', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Kevin De Bruyne', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Jérémy Doku', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Charles De Ketelaere', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Leandro Trossard', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Loïs Openda', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Romelu Lukaku', 'player', false);

  -- Egito
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Egito', 'EGY', 'team', 26)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Mohamed El Shenawy', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Mohamed Hany', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Mohamed Hamdy', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Yasser Ibrahim', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Khaled Sobhi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Ramy Rabia', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Hossam Abdelmaguid', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Ahmed Fatouh', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Marwan Attia', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Zizo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Hamdy Fathy', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Mohamed Lasheen', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Emam Ashour', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Osama Faisal', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Mohamed Salah', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Mostafa Mohamed', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Trézéguet', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Omar Marmoush', 'player', false);

  -- Irã
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Irã', 'IRN', 'team', 27)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Alireza Beiranvand', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Morteza Pouraliganji', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Ehsan Hajsafi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Milad Mohammadi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Shojae Khalilzadeh', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Ramin Rezaeian', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Hossein Kanaani', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Sadegh Moharrami', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Saleh Hardani', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Saeed Ezatolahi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Saman Ghoddos', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Omid Noorafkan', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Roozbeh Cheshmi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Mohammad Mohebi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Sardar Azmoun', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Mehdi Taremi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Alireza Jahanbakhsh', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Ali Gholizadeh', 'player', false);

  -- Nova Zelândia
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Nova Zelândia', 'NZL', 'team', 28)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Max Crocombe', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Alex Paulsen', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Michael Boxall', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Liberato Cacace', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Tim Payne', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Tyler Bindon', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Francis de Vries', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Finn Surman', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Joe Bell', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Sarpreet Singh', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Ryan Thomas', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Matthew Garbett', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Marko Stamenić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Ben Old', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Chris Wood', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Elijah Just', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Callum McCowatt', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Kosta Barbarouses', 'player', false);

  -- Espanha
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Espanha', 'ESP', 'team', 29)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Unai Simón', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Robin Le Normand', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Aymeric Laporte', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Dean Huijsen', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Pedro Porro', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Dani Carvajal', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Marc Cucurella', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Martín Zubimendi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Rodri', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Pedri', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Fabián Ruiz', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Mikel Merino', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Lamine Yamal', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Dani Olmo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Nico Williams', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Ferran Torres', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Álvaro Morata', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Mikel Oyarzabal', 'player', false);

  -- Cabo Verde
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Cabo Verde', 'CPV', 'team', 30)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Vozinha', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Logan Costa', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Pico', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Diney', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Steven Moreira', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Wagner Pina', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'João Paulo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Yannick Semedo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Kévin Pina', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Patrick Andrade', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Jamiro Monteiro', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Deroy Duarte', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Garry Rodrigues', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Jovane Cabral', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Ryan Mendes', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Dailon Livramento', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Willy Semedo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Bebé', 'player', false);

  -- Arábia Saudita
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Arábia Saudita', 'KSA', 'team', 31)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Nawaf Alaqidi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Abdulrahman Al-Sanbi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Saud Abdulhamid', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Nawaf Boushal', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Jihad Thakri', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Moteb Al-Harbi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Hassan Al-Tambakti', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Musab Aljuwayr', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Ziyad Aljohani', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Abdullah Alkhaibari', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Nasser Al-Dawsari', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Saleh Abu Alshamat', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Marwan Al-Sahafi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Salem Al-Dawsari', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Abdulrahman Al-Aboud', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Firas Al-Buraikan', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Saleh Al-Shehri', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Abdullah Al-Hamdan', 'player', false);

  -- Uruguai
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Uruguai', 'URU', 'team', 32)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Sergio Rochet', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Santiago Mele', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Ronald Araújo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'José María Giménez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Sebastián Cáceres', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Mathías Olivera', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Guillermo Varela', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Nahitan Nández', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Federico Valverde', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Giorgian de Arrascaeta', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Rodrigo Bentancur', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Manuel Ugarte', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Nicolás de la Cruz', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Maxi Araújo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Darwin Núñez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Federico Viñas', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Rodrigo Aguirre', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Facundo Pellistri', 'player', false);

  -- França
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'França', 'FRA', 'team', 33)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Mike Maignan', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Theo Hernández', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'William Saliba', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Jules Koundé', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Ibrahima Konaté', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Dayot Upamecano', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Lucas Digne', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Aurélien Tchouaméni', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Eduardo Camavinga', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Manu Koné', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Adrien Rabiot', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Michael Olise', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Ousmane Dembélé', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Bradley Barcola', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Désiré Doué', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Kingsley Coman', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Hugo Ekitiké', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Kylian Mbappé', 'player', false);

  -- Senegal
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Senegal', 'SEN', 'team', 34)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Édouard Mendy', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Yehvann Diouf', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Moussa Niakhaté', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Abdoulaye Seck', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Ismail Jakobs', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'El Hadji Malick Diouf', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Kalidou Koulibaly', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Idrissa Gana Gueye', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Pape Matar Sarr', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Pape Gueye', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Habib Diarra', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Lamine Camara', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Sadio Mané', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Ismaïla Sarr', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Boulaye Dia', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Iliman Ndiaye', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Nicolas Jackson', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Krépin Diatta', 'player', false);

  -- Iraque
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Iraque', 'IRQ', 'team', 35)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Jalal Hassan', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Rebin Sulaka', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Hussein Ali', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Akam Hashem', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Merchas Doski', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Zaid Tahseen', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Manaf Younis', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Zidane Iqbal', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Amir Al-Ammari', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Ibrahim Bayesh', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Ali Jasim', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Youssef Amyn', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Aymen Hussein', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Marko Farji', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Osama Rashid', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Ali Al-Hamadi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Aimar Sher', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Mohanad Ali', 'player', false);

  -- Noruega
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Noruega', 'NOR', 'team', 36)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Ørjan Nyland', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Julian Ryerson', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Leo Østigård', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Kristoffer Ajer', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Marcus Holmgren Pedersen', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'David Møller Wolfe', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Torbjørn Heggem', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Morten Thorsby', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Martin Ødegaard', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Sander Berge', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Andreas Schjelderup', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Patrick Berg', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Erling Haaland', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Alexander Sørloth', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Aron Dønnum', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Jørgen Strand Larsen', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Antonio Nusa', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Oscar Bobb', 'player', false);

  -- Argentina
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Argentina', 'ARG', 'team', 37)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Emiliano Martínez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Nahuel Molina', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Cristian Romero', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Nicolás Otamendi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Nicolás Tagliafico', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Leonardo Balerdi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Enzo Fernández', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Alexis Mac Allister', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Rodrigo De Paul', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Exequiel Palacios', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Leandro Paredes', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Nico Paz', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Franco Mastantuono', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Nico González', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Lionel Messi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Lautaro Martínez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Julián Álvarez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Giuliano Simeone', 'player', false);

  -- Argélia
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Argélia', 'ALG', 'team', 38)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Alexis Guendouz', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Ramy Bensebaini', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Youcef Atal', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Rayan Aït-Nouri', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Mohamed Amine Tougai', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Aïssa Mandi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Ismaël Bennacer', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Houssem Aouar', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Hicham Boudaoui', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Ramiz Zerrouki', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Nabil Bentaleb', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Farès Chaïbi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Riyad Mahrez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Saïd Benrahma', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Anis Hadj Moussa', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Amine Gouiri', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Baghdad Bounedjah', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Mohamed Amoura', 'player', false);

  -- Áustria
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Áustria', 'AUT', 'team', 39)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Alexander Schlager', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Patrick Pentz', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'David Alaba', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Kevin Danso', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Philipp Lienhart', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Stefan Posch', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Phillipp Mwene', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Alexander Prass', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Xaver Schlager', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Marcel Sabitzer', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Konrad Laimer', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Florian Grillitsch', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Nicolas Seiwald', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Romano Schmid', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Patrick Wimmer', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Christoph Baumgartner', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Michael Gregoritsch', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Marko Arnautović', 'player', false);

  -- Jordânia
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Jordânia', 'JOR', 'team', 40)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Yazeed Abulaila', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Ihsan Haddad', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Mohammad Abu Hashish', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Yazan Al-Arab', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Abdallah Nasib', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Salem Obaid', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Mohammad Abualnadi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Ibrahim Saadeh', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Nizar Al-Rashdan', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Noor Al-Rawabdeh', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Mohannad Abu Taha', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Amer Jamous', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Mousa Al-Taamari', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Yazan Al-Naimat', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Mahmoud Al-Mardi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Ali Olwan', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Mohammad Abu Zrayq', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Ibrahim Sabra', 'player', false);

  -- Portugal
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Portugal', 'POR', 'team', 41)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Diogo Costa', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'José Sá', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Rúben Dias', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'João Cancelo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Diogo Dalot', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Nuno Mendes', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Gonçalo Inácio', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Bernardo Silva', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Bruno Fernandes', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Rúben Neves', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Vitinha', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'João Neves', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Cristiano Ronaldo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Francisco Trincão', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'João Félix', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Gonçalo Ramos', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Pedro Neto', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Rafael Leão', 'player', false);

  -- Congo (RD)
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Congo (RD)', 'COD', 'team', 42)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Lionel Mpasi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Aaron Wan-Bissaka', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Axel Tuanzebe', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Arthur Masuaku', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Chancel Mbemba', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Joris Kayembe', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Charles Pickel', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Ngal''ayel Mukau', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Edo Kayembe', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Samuel Moutoussamy', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Noah Sadiki', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Théo Bongonda', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Meschack Elia', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Yoane Wissa', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Brian Cipenga', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Fiston Mayele', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Cédric Bakambu', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Nathanaël Mbuku', 'player', false);

  -- Uzbequistão
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Uzbequistão', 'UZB', 'team', 43)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Utkir Yusupov', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Farrukh Sayfiev', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Sherzod Nasrullaev', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Umar Eshmurodov', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Husniddin Aliqulov', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Rustamjon Ashurmatov', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Khojiakbar Alijonov', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Abdukodir Khusanov', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Odiljon Hamrobekov', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Otabek Shukurov', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Jamshid Iskanderov', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Azizbek Turgunboev', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Khojimat Erkinov', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Eldor Shomurodov', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Oston Urunov', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Jaloliddin Masharipov', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Igor Sergeev', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Abbosbek Fayzullaev', 'player', false);

  -- Colômbia
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Colômbia', 'COL', 'team', 44)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Camilo Vargas', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'David Ospina', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Dávinson Sánchez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Yerry Mina', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Daniel Muñoz', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Johan Mojica', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Jhon Lucumí', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Santiago Arias', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Jefferson Lerma', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Kevin Castaño', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Richard Ríos', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'James Rodríguez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Juan Fernando Quintero', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Jorge Carrascal', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'John Arias', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Jhon Córdoba', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Luis Suárez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Luis Díaz', 'player', false);

  -- Inglaterra
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Inglaterra', 'ENG', 'team', 45)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Jordan Pickford', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'John Stones', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Marc Guéhi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Ezri Konsa', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Trent Alexander-Arnold', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Reece James', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Dan Burn', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Jordan Henderson', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Declan Rice', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Jude Bellingham', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Cole Palmer', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Morgan Rogers', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Anthony Gordon', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Phil Foden', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Bukayo Saka', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Harry Kane', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Marcus Rashford', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Ollie Watkins', 'player', false);

  -- Croácia
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Croácia', 'CRO', 'team', 46)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Dominik Livaković', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Duje Ćaleta-Car', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Joško Gvardiol', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Josip Stanišić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Luka Vušković', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Josip Šutalo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Kristijan Jakić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Luka Modrić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Mateo Kovačić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Martin Baturina', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Lovro Majer', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Mario Pašalić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Petar Sučić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Ivan Perišić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'Marco Pašalić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Ante Budimir', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Andrej Kramarić', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Franjo Ivanović', 'player', false);

  -- Gana
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Gana', 'GHA', 'team', 47)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Lawrence Ati-Zigi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Tariq Lamptey', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Mohammed Salisu', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Alidu Seidu', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Alexander Djiku', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Gideon Mensah', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'Caleb Yirenkyi', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'Fatawu Issahaku', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Thomas Partey', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Salis Abdul Samed', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Kamaldeen Sulemana', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Mohammed Kudus', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Iñaki Williams', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Jordan Ayew', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'André Ayew', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Joseph Paintsil', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'Osman Bukari', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Antoine Semenyo', 'player', false);

  -- Panamá
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Panamá', 'PAN', 'team', 48)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Escudo', 'crest', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Orlando Mosquera', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 3, 'Luis Mejía', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 4, 'Fidel Escobar', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 5, 'Andrés Andrade', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 6, 'Michael Amir Murillo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 7, 'Eric Davis', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 8, 'José Córdoba', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 9, 'César Blackman', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 10, 'Cristian Martínez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 11, 'Aníbal Godoy', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 12, 'Adalberto Carrasquilla', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 13, 'Foto da equipe', 'team_photo', false),
  (p_user_id, v_collection_id, v_team_id, 14, 'Édgar Bárcenas', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 15, 'Carlos Harvey', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 16, 'Ismael Díaz', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 17, 'José Fajardo', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 18, 'Cecilio Waterman', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 19, 'José Luis Rodríguez', 'player', false),
  (p_user_id, v_collection_id, v_team_id, 20, 'Alberto Quintero', 'player', false);

  -- Especiais
  insert into teams (user_id, collection_id, name, code, kind, order_index)
  values (p_user_id, v_collection_id, 'Especiais', 'SPECIAL', 'special', 49)
  returning id into v_team_id;
  insert into stickers (user_id, collection_id, team_id, number, label, sticker_type, is_foil) values
  (p_user_id, v_collection_id, v_team_id, 1, 'Logo Panini (00)', 'emblem', true),
  (p_user_id, v_collection_id, v_team_id, 2, 'Emblema Oficial (FWC1)', 'emblem', true),
  (p_user_id, v_collection_id, v_team_id, 3, 'Emblema Oficial (FWC2)', 'emblem', true),
  (p_user_id, v_collection_id, v_team_id, 4, 'Mascotes Oficiais (FWC3)', 'mascot', true),
  (p_user_id, v_collection_id, v_team_id, 5, 'Slogan Oficial (FWC4)', 'special', true),
  (p_user_id, v_collection_id, v_team_id, 6, 'Bola Oficial (FWC5)', 'special', true),
  (p_user_id, v_collection_id, v_team_id, 7, 'Canadá - Países e Cidades-sede (FWC6)', 'stadium', true),
  (p_user_id, v_collection_id, v_team_id, 8, 'México - Países e Cidades-sede (FWC7)', 'stadium', true),
  (p_user_id, v_collection_id, v_team_id, 9, 'EUA - Países e Cidades-sede (FWC8)', 'stadium', true),
  (p_user_id, v_collection_id, v_team_id, 10, 'Itália 1934 (FWC9)', 'history', true),
  (p_user_id, v_collection_id, v_team_id, 11, 'Uruguai 1950 (FWC10)', 'history', true),
  (p_user_id, v_collection_id, v_team_id, 12, 'Alemanha Ocidental 1954 (FWC11)', 'history', true),
  (p_user_id, v_collection_id, v_team_id, 13, 'Brasil 1962 (FWC12)', 'history', true),
  (p_user_id, v_collection_id, v_team_id, 14, 'Alemanha Ocidental 1974 (FWC13)', 'history', true),
  (p_user_id, v_collection_id, v_team_id, 15, 'Argentina 1986 (FWC14)', 'history', true),
  (p_user_id, v_collection_id, v_team_id, 16, 'Brasil 1994 (FWC15)', 'history', true),
  (p_user_id, v_collection_id, v_team_id, 17, 'Brasil 2002 (FWC16)', 'history', true),
  (p_user_id, v_collection_id, v_team_id, 18, 'Itália 2006 (FWC17)', 'history', true),
  (p_user_id, v_collection_id, v_team_id, 19, 'Alemanha 2014 (FWC18)', 'history', true),
  (p_user_id, v_collection_id, v_team_id, 20, 'Argentina 2022 (FWC19)', 'history', true);

  return v_collection_id;
end;
$$;
