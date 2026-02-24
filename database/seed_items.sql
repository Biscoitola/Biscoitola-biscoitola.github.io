-- Seed current gift list into PostgreSQL
-- Run after schema.sql

insert into gift_items (id, category_id, name, description)
values
  ('coz-kit-panelas-tramontina', 'cozinha', 'Kit panelas Tramontina fundo triplo', 'Conjunto de panelas em aco inox para uso diario.'),
  ('coz-faqueiro-tramontina', 'cozinha', '2 kits de talheres Tramontina', 'Faqueiro 16 pecas - linha Laguna.'),
  ('coz-porta-talheres', 'cozinha', 'Porta talheres', 'Organizador para manter os talheres separados.'),
  ('coz-porta-temperos', 'cozinha', 'Porta temperos', 'Suporte para organizar os temperos da cozinha.'),
  ('coz-jarra-vidro', 'cozinha', 'Jarra de vidro', 'Jarra para agua e sucos.'),
  ('coz-espremedor', 'cozinha', 'Espremedor', 'Espremedor para frutas.'),
  ('coz-liquidificador', 'cozinha', 'Liquidificador', 'Liquidificador para uso diario.'),
  ('coz-batedeira', 'cozinha', 'Batedeira', 'Batedeira para massas e receitas doces.'),
  ('coz-potes-hermeticos', 'cozinha', 'Potes hermeticos', 'Conjunto para armazenar alimentos.'),
  ('coz-tacas-agua', 'cozinha', 'Tacas para agua', 'Jogo de tacas para agua.'),
  ('coz-lixo-grande', 'cozinha', 'Lixo grande cozinha', 'Lixeira grande para cozinha.'),
  ('coz-lixo-pequeno-bege', 'cozinha', 'Lixo pequeno cozinha bege', 'Lixeira pequena para pia/apoio.'),
  ('coz-multiprocessador', 'cozinha', 'Multiprocessador', 'Item solicitado (link em breve).'),
  ('coz-liquidificador-multiprocessador', 'cozinha', 'Liquidificador multiprocessador', 'Versao 2 em 1.'),
  ('lim-aspirador', 'limpeza', 'Aspirador', 'Item solicitado (link em breve).'),
  ('lim-aspirador-philco', 'limpeza', 'Aspirador de po Philco', 'Opcao de aspirador para casa.'),
  ('lim-vassoura-cabo', 'limpeza', 'Vassoura com cabo', 'Vassoura para limpeza geral.'),
  ('lim-rodo', 'limpeza', 'Rodo', 'Rodo para piso.'),
  ('lim-dispenser-lavanderia', 'limpeza', 'Kit 3 dispenser lavanderia', 'Dispenser para sabao/amaciante.'),
  ('lim-pano-microfibra', 'limpeza', 'Pano microfibra', 'Pano para limpeza delicada.'),
  ('lim-pano-chao', 'limpeza', 'Pano de chao', 'Pano para limpeza pesada.'),
  ('lim-pazinha', 'limpeza', 'Pazinha', 'Pazinha para coleta de sujeira.'),
  ('ban-chuveiro-eletrico', 'banheiro', 'Chuveiro eletrico', 'Ducha eletrica para banheiro.'),
  ('ban-toalha-rosto-buddemeyer', 'banheiro', 'Toalha de rosto Buddemeyer', 'Toalha de rosto de boa qualidade.'),
  ('ban-lixeira-12l-inox', 'banheiro', 'Lixeira banheiro 12L inox', 'Lixeira inox para banheiro.'),
  ('ban-kit-tapetes', 'banheiro', 'Kit tapetes de banheiro', 'Conjunto de tapetes para banheiro.'),
  ('qua-kit-casal-4pecas-cor-lisa', 'quarto', 'Kit casal 4 pecas cor lisa', 'Conjunto para cama de casal (link em breve).'),
  ('qua-kit-casal-4pecas', 'quarto', 'Kit casal 4 pecas', 'Outra opcao de kit de cama casal (link em breve).')
on conflict (id) do update
set category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description;
