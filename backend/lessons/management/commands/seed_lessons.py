"""
Management command to seed sample lesson data.
"""

from django.core.management.base import BaseCommand

from lessons.models import Scenario, Lesson


class Command(BaseCommand):
    help = 'Seed the database with sample lesson data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding lesson data...')

        # Clear existing data (optional, for development)
        if options.get('clear', False):
            Lesson.objects.all().delete()
            Scenario.objects.all().delete()
            self.stdout.write('Cleared existing lesson data.')

        # Create Spanish Cafe Scenario
        spanish_cafe, created = Scenario.objects.get_or_create(
            title='At the Cafe',
            language='es',
            defaults={
                'description': 'Learn to order drinks and snacks at a Spanish cafe. Perfect for travelers wanting to enjoy local coffee culture.',
                'context_tags': ['travel', 'food'],
                'difficulty': 'beginner',
                'is_active': True,
            }
        )
        if created:
            self.stdout.write(f'  Created scenario: {spanish_cafe.title}')
        else:
            self.stdout.write(f'  Scenario already exists: {spanish_cafe.title}')

        # Create French Cafe Scenario
        french_cafe, created = Scenario.objects.get_or_create(
            title='Au Cafe',
            language='fr',
            defaults={
                'description': 'Apprenez a commander des boissons et des collations dans un cafe francais.',
                'context_tags': ['travel', 'food'],
                'difficulty': 'beginner',
                'is_active': True,
            }
        )
        if created:
            self.stdout.write(f'  Created scenario: {french_cafe.title}')
        else:
            self.stdout.write(f'  Scenario already exists: {french_cafe.title}')

        # Spanish Lesson 1: Ordering Coffee
        spanish_lesson_1, created = Lesson.objects.get_or_create(
            scenario=spanish_cafe,
            title='Ordering Coffee',
            defaults={
                'lesson_type': 'gist',
                'description': 'Listen to a customer ordering coffee and understand the main points.',
                'order': 1,
                'estimated_minutes': 5,
                'is_active': True,
                'steps': [
                    {
                        'type': 'audio',
                        'id': 'intro',
                        'audio_url': '/media/audio/cafe-order-es.mp3',
                        'title': 'Listen to the conversation',
                        'description': 'A customer is ordering at a cafe in Madrid. Listen carefully and try to understand what they order.',
                    },
                    {
                        'type': 'question',
                        'id': 'q1',
                        'question': 'What did the customer order to drink?',
                        'options': [
                            'Un cafe con leche',
                            'Un te',
                            'Un zumo de naranja',
                            'Agua',
                        ],
                        'correct_index': 0,
                        'audio_url': '/media/audio/cafe-order-es.mp3',
                        'explanation': "The customer said 'Un cafe con leche, por favor' - a coffee with milk.",
                    },
                    {
                        'type': 'reveal',
                        'id': 'r1',
                        'correct_answer': 'Un cafe con leche (Coffee with milk)',
                        'transcript': 'Cliente: Hola, buenos dias.\nCamarero: Buenos dias! Que desea?\nCliente: Un cafe con leche, por favor.\nCamarero: Muy bien. Algo mas?\nCliente: No, gracias. Cuanto es?\nCamarero: Son dos euros cincuenta.\nCliente: Aqui tiene. Gracias.\nCamarero: Gracias a usted!',
                        'translation': "Customer: Hello, good morning.\nWaiter: Good morning! What would you like?\nCustomer: A coffee with milk, please.\nWaiter: Very well. Anything else?\nCustomer: No, thank you. How much is it?\nWaiter: That's two euros fifty.\nCustomer: Here you go. Thank you.\nWaiter: Thank you!",
                        'key_phrases': [
                            {'spanish': 'Buenos dias', 'english': 'Good morning'},
                            {'spanish': 'Que desea?', 'english': 'What would you like?'},
                            {'spanish': 'por favor', 'english': 'please'},
                            {'spanish': 'Cuanto es?', 'english': 'How much is it?'},
                        ],
                    },
                    {
                        'type': 'question',
                        'id': 'q2',
                        'question': 'How much did the coffee cost?',
                        'options': [
                            '1.50 euros',
                            '2.00 euros',
                            '2.50 euros',
                            '3.00 euros',
                        ],
                        'correct_index': 2,
                        'audio_url': '/media/audio/cafe-order-es.mp3',
                        'explanation': "The waiter said 'Son dos euros cincuenta' - that's 2.50 euros.",
                    },
                    {
                        'type': 'reveal',
                        'id': 'r2',
                        'correct_answer': '2.50 euros',
                        'transcript': 'Camarero: Son dos euros cincuenta.',
                        'translation': "Waiter: That's two euros fifty.",
                        'tip': "In Spanish, prices are often said as 'dos euros cincuenta' (two euros fifty) rather than 'dos con cincuenta'.",
                    },
                ],
            }
        )
        if created:
            self.stdout.write(f'  Created lesson: {spanish_lesson_1.title}')
        else:
            self.stdout.write(f'  Lesson already exists: {spanish_lesson_1.title}')

        # Spanish Lesson 2: Ordering a Snack
        spanish_lesson_2, created = Lesson.objects.get_or_create(
            scenario=spanish_cafe,
            title='Ordering a Snack',
            defaults={
                'lesson_type': 'gist',
                'description': 'Listen to someone ordering food at the cafe.',
                'order': 2,
                'estimated_minutes': 5,
                'is_active': True,
                'steps': [
                    {
                        'type': 'audio',
                        'id': 'intro',
                        'audio_url': '/media/audio/cafe-snack-es.mp3',
                        'title': 'Listen to the conversation',
                        'description': 'A customer is ordering a snack. What do they choose?',
                    },
                    {
                        'type': 'question',
                        'id': 'q1',
                        'question': 'What snack did the customer order?',
                        'options': [
                            'Un croissant',
                            'Una tostada',
                            'Un bocadillo',
                            'Un pastel',
                        ],
                        'correct_index': 1,
                        'audio_url': '/media/audio/cafe-snack-es.mp3',
                        'explanation': "The customer ordered 'una tostada con tomate' - toast with tomato.",
                    },
                    {
                        'type': 'reveal',
                        'id': 'r1',
                        'correct_answer': 'Una tostada (Toast)',
                        'transcript': 'Cliente: Perdon, tienen algo para comer?\nCamarero: Si, tenemos tostadas, croissants, y bocadillos.\nCliente: Una tostada con tomate, por favor.\nCamarero: Perfecto, ahora se la traigo.',
                        'translation': "Customer: Excuse me, do you have anything to eat?\nWaiter: Yes, we have toast, croissants, and sandwiches.\nCustomer: Toast with tomato, please.\nWaiter: Perfect, I'll bring it right away.",
                        'key_phrases': [
                            {'spanish': 'Perdon', 'english': 'Excuse me'},
                            {'spanish': 'tienen algo para comer?', 'english': 'do you have anything to eat?'},
                            {'spanish': 'ahora se la traigo', 'english': "I'll bring it right away"},
                        ],
                    },
                ],
            }
        )
        if created:
            self.stdout.write(f'  Created lesson: {spanish_lesson_2.title}')
        else:
            self.stdout.write(f'  Lesson already exists: {spanish_lesson_2.title}')

        # French Lesson 1: Commander un cafe
        french_lesson_1, created = Lesson.objects.get_or_create(
            scenario=french_cafe,
            title='Commander un cafe',
            defaults={
                'lesson_type': 'gist',
                'description': 'Ecoutez un client commander un cafe et comprenez les points principaux.',
                'order': 1,
                'estimated_minutes': 5,
                'is_active': True,
                'steps': [
                    {
                        'type': 'audio',
                        'id': 'intro',
                        'audio_url': '/media/audio/cafe-order-fr.mp3',
                        'title': 'Ecoutez la conversation',
                        'description': 'Un client commande dans un cafe parisien. Ecoutez attentivement.',
                    },
                    {
                        'type': 'question',
                        'id': 'q1',
                        'question': "Qu'est-ce que le client a commande?",
                        'options': [
                            'Un cafe creme',
                            'Un the',
                            'Un chocolat chaud',
                            "Un jus d'orange",
                        ],
                        'correct_index': 0,
                        'audio_url': '/media/audio/cafe-order-fr.mp3',
                        'explanation': "Le client a dit 'Un cafe creme, s'il vous plait'.",
                    },
                    {
                        'type': 'reveal',
                        'id': 'r1',
                        'correct_answer': 'Un cafe creme',
                        'transcript': "Client: Bonjour!\nServeur: Bonjour! Qu'est-ce que je vous sers?\nClient: Un cafe creme, s'il vous plait.\nServeur: Tres bien. Ce sera tout?\nClient: Oui, merci. C'est combien?\nServeur: Trois euros cinquante.\nClient: Voila. Merci!\nServeur: Merci a vous!",
                        'translation': "Customer: Hello!\nWaiter: Hello! What can I get you?\nCustomer: A coffee with cream, please.\nWaiter: Very well. Will that be all?\nCustomer: Yes, thank you. How much is it?\nWaiter: Three euros fifty.\nCustomer: Here you go. Thank you!\nWaiter: Thank you!",
                        'key_phrases': [
                            {'french': 'Bonjour', 'english': 'Hello'},
                            {'french': "Qu'est-ce que je vous sers?", 'english': 'What can I get you?'},
                            {'french': "s'il vous plait", 'english': 'please'},
                            {'french': "C'est combien?", 'english': 'How much is it?'},
                        ],
                    },
                ],
            }
        )
        if created:
            self.stdout.write(f'  Created lesson: {french_lesson_1.title}')
        else:
            self.stdout.write(f'  Lesson already exists: {french_lesson_1.title}')

        self.stdout.write(self.style.SUCCESS('Successfully seeded lesson data!'))
        self.stdout.write(f'  Total scenarios: {Scenario.objects.count()}')
        self.stdout.write(f'  Total lessons: {Lesson.objects.count()}')
