from tresult import TestResult

def test_first_page(driver):
    res = TestResult()

    num_paragraphs_per_page = 5
    for i in range(1, num_paragraphs_per_page+1):
        # TODO: check if paragraph id specification is in handout
        if len(driver.find_elements(by='id', value=f'paragraph_{i}')) != 1:
            res.fail(f'Q3 Paragraph {i}, First Page', 
                     f"Cannot find element with id 'paragraph_{i}'.")
        else:
            res.succeed(f'Q3 Paragraph {i}, First Page')

    return res
