# #!/usr/bin/env python
# """Django's command-line utility for administrative tasks."""
# import os, sys, traceback

# import logging
# logger = logging.getLogger(__name__)


# def main():
#     """Run administrative tasks."""
#     os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
#     try:
#         from django.core.management import execute_from_command_line
#     except ImportError as exc:
#         raise ImportError(
#             "Couldn't import Django. Are you sure it's installed and "
#             "available on your PYTHONPATH environment variable? Did you "
#             "forget to activate a virtual environment?"
#         ) from exc
        
#     print(sys.argv)
#     execute_from_command_line([sys.argv[0], 'test'])
#     execute_from_command_line(sys.argv)


# if __name__ == '__main__':
#     main()
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

import app.kafka_consumer

# import logging
# logger = logging.getLogger(__name__)
# logger.info('something here')

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
