-- Seed current gift list into PostgreSQL
-- Run after schema.sql

insert into gift_items (id, category_id, name, description)
values
  ('coz-kit-panelas-tramontina', 'cozinha', 'Kit panelas Tramontina fundo triplo', 'Conjunto de panelas em aco inox para uso diario.'),
  ('coz-faqueiro-tramontina', 'cozinha', '2 kits de talheres Tramontina', 'Faqueiro 16 pecas - linha Laguna.'),
  ('coz-mixer-elgin', 'cozinha', 'Mixer Power Inox 3 em 1 600W Elgin Lunar', 'Mixer para uso diario.'),
  ('coz-assadeiras-tramontina', 'cozinha', 'Jogo de Assadeiras Tramontina', 'Jogo de assadeiras antiaderente Tramontina.'),
  ('coz-cortador-multifuncional', 'cozinha', 'Cortador Multifuncional de Legumes', 'Cortador e fatiador multifuncional para legumes.'),
  ('coz-kit-facas-tramontina', 'cozinha', 'Kit de Facas Tramontina Plenus', 'Jogo de facas com 9 pecas Tramontina.'),
  ('coz-assadeiras-vidro-marinex', 'cozinha', 'Jogo 3 Assadeiras de Vidro Marinex', 'Jogo com 3 assadeiras retangulares de vidro.'),
  ('coz-chaleira-eletrica-inox', 'cozinha', 'Chaleira Eletrica Inox', 'Chaleira eletrica inox com desligamento automatico.'),
  ('coz-fervedor-leiteira', 'cozinha', 'Fervedor Leiteira Antiaderente', 'Fervedor leiteira antiaderente para cozinha.'),
  ('coz-oven-fryer-oster', 'cozinha', 'Fritadeira sem Ã“leo Oster Oven Fryer 3 em 1', 'Oven fryer 3 em 1, 12 litros, 1800W.'),
  ('coz-abridor-latas-manual', 'cozinha', 'Abridor de Latas Manual Premium', 'Abridor de latas manual multiuso.'),
  ('coz-forma-pizza-redonda', 'cozinha', 'Forma de Pizza Redonda Antiaderente', 'Assadeira redonda antiaderente para pizza.'),
  ('coz-abridor-furador-vinho', 'cozinha', 'Abridor e Furador de Vinho', 'Abridor/furador profissional portatil para vinho.'),
  ('coz-tabua-corte-inox', 'cozinha', 'Tabua de Corte Dupla Face Inox', 'Tabua de corte dupla face em aco inox.'),
  ('coz-tabua-magica-descongelar', 'cozinha', 'Tabua Magica para Descongelar', 'Tabua para descongelar alimentos na cozinha.'),
  ('coz-porta-talheres', 'cozinha', 'Porta talheres', 'Organizador para manter os talheres separados.'),
  ('coz-porta-temperos', 'cozinha', 'Porta temperos', 'Suporte para organizar os temperos da cozinha.'),
  ('coz-jarra-vidro', 'cozinha', 'Jarra de vidro', 'Jarra para agua e sucos.'),
  ('coz-potes-hermeticos', 'cozinha', 'Potes hermeticos', 'Conjunto para armazenar alimentos.'),
  ('coz-tacas-agua', 'cozinha', 'Tacas para agua', 'Jogo de tacas para agua.'),
  ('coz-lixo-grande', 'cozinha', 'Lixo grande cozinha', 'Lixeira grande para cozinha.'),
  ('coz-lixo-pequeno-bege', 'cozinha', 'Lixo pequeno cozinha bege', 'Lixeira pequena para pia/apoio.'),
  ('coz-multiprocessador', 'cozinha', 'Multiprocessador', 'Item solicitado (link em breve).'),
  ('coz-liquidificador-multiprocessador', 'cozinha', 'Liquidificador multiprocessador', 'Versao 2 em 1.'),
  ('lim-aspirador', 'limpeza', 'Aspirador', 'Item solicitado (link em breve).'),
  ('lim-aspirador-philco', 'limpeza', 'Aspirador de po Philco', 'Opcao de aspirador para casa.'),
  ('lim-rodo', 'limpeza', 'Rodo', 'Rodo para piso.'),
  ('lim-dispenser-lavanderia', 'limpeza', 'Kit 3 dispenser lavanderia', 'Dispenser para sabao/amaciante.'),
  ('lim-cesto-bambu-duplo', 'limpeza', 'Cesto de bambu grande duplo com divisorias', 'Cesto para roupas sujas com divisorias.'),
  ('lim-pano-microfibra', 'limpeza', 'Pano microfibra', 'Pano para limpeza delicada.'),
  ('lim-pano-chao', 'limpeza', 'Pano de chao', 'Pano para limpeza pesada.'),
  ('lim-pazinha', 'limpeza', 'Pazinha', 'Pazinha para coleta de sujeira.'),
  ('ban-toalha-rosto-buddemeyer', 'banheiro', 'Toalha de rosto Buddemeyer', 'Toalha de rosto de boa qualidade.'),
  ('ban-toalhas-banho', 'banheiro', 'Toalhas de banho', 'Toalhas de banho (compra de sua escolha).'),
  ('ban-porta-escova-dente', 'banheiro', 'Porta Escova de Dente', 'Porta escova de dente para banheiro.'),
  ('ban-lixeira-12l-inox', 'banheiro', 'Lixeira banheiro 12L inox', 'Lixeira inox para banheiro.'),
  ('ban-kit-tapetes', 'banheiro', 'Kit tapetes de banheiro', 'Conjunto de tapetes para banheiro.'),
  ('qua-kit-casal-4pecas-cor-lisa', 'quarto', 'Kit casal 4 pecas cor lisa', 'Jogo de cama casal liso, opcao classica e elegante.'),
  ('qua-kit-casal-4pecas', 'quarto', 'Kit casal 4 pecas', 'Jogo de cama casal estampado, opcao alegre e delicada.')

on conflict (id) do update
set category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description;

delete from gift_items
where id = 'coz-liquidificador';

delete from gift_items
where id in ('coz-espremedor', 'coz-batedeira');

delete from gift_items
where id = 'ban-chuveiro-eletrico';

delete from gift_items
where id = 'coz-esterilizador-facas';

delete from gift_items
where id = 'coz-porta-escova-dente';

delete from gift_items
where id = 'lim-vassoura-cabo';




